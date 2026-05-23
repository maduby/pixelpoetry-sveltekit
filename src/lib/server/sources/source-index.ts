import { createHash } from 'node:crypto';
import { EXPLAINERS_FOR_KNOWLEDGE } from '$lib/explainers/registry';
import type { Chapter, Source, Step } from '$lib/types/explainer';
import { embedSourceText, type EmbeddingEnv } from '$lib/server/ai/embeddings';
import type { db as appDb } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';

type DbClient = typeof appDb;

export interface SourceDocumentInput {
	id: string;
	sourceId: string;
	explainerSlug: string;
	short: string;
	full: string;
	url: string | null;
	year: number;
	contentHash: string;
}

export interface SourceChunkInput {
	id: string;
	sourceDocumentId: string;
	sourceId: string;
	explainerSlug: string;
	chapterId: string | null;
	stepId: string | null;
	chunkKind: string;
	chunkText: string;
	url: string | null;
	contentHash: string;
}

export interface SourceKnowledgeSnapshot {
	documents: SourceDocumentInput[];
	chunks: SourceChunkInput[];
}

export interface SourceIngestResult {
	documents: number;
	chunks: number;
	embeddedChunks: number;
}

export function collectSourceKnowledge(): SourceKnowledgeSnapshot {
	const documents = new Map<string, SourceDocumentInput>();
	const chunks = new Map<string, SourceChunkInput>();

	for (const explainer of EXPLAINERS_FOR_KNOWLEDGE) {
		for (const source of Object.values(explainer.sources)) {
			const document = sourceDocumentFromSource(explainer.slug, source);
			documents.set(document.id, document);

			addChunk(chunks, {
				sourceDocumentId: document.id,
				sourceId: source.id,
				explainerSlug: explainer.slug,
				chapterId: null,
				stepId: null,
				chunkKind: 'source_full',
				chunkText: source.full,
				url: source.url ?? null
			});

			for (const [index, reference] of (source.references ?? []).entries()) {
				addChunk(chunks, {
					sourceDocumentId: document.id,
					sourceId: source.id,
					explainerSlug: explainer.slug,
					chapterId: null,
					stepId: null,
					chunkKind: `source_reference_${index + 1}`,
					chunkText: reference.citation,
					url: reference.url ?? source.url ?? null
				});
			}
		}

		for (const chapter of explainer.chapters) {
			addChapterSourceChunks(chunks, explainer.slug, chapter, explainer.sources);
		}
	}

	return {
		documents: Array.from(documents.values()).sort((a, b) => a.id.localeCompare(b.id)),
		chunks: Array.from(chunks.values()).sort((a, b) => a.id.localeCompare(b.id))
	};
}

export async function ingestSourceKnowledge(
	db: DbClient,
	env: EmbeddingEnv
): Promise<SourceIngestResult> {
	const snapshot = collectSourceKnowledge();
	const now = new Date();
	let embeddedChunks = 0;

	for (const document of snapshot.documents) {
		await db
			.insert(schema.sourceDocument)
			.values({ ...document, createdAt: now, updatedAt: now })
			.onConflictDoUpdate({
				target: schema.sourceDocument.id,
				set: {
					short: document.short,
					full: document.full,
					url: document.url,
					year: document.year,
					contentHash: document.contentHash,
					updatedAt: now
				}
			});
	}

	for (const chunk of snapshot.chunks) {
		const embedding = await embedSourceText(chunk.chunkText, env);
		if (embedding) embeddedChunks += 1;

		await db
			.insert(schema.sourceChunk)
			.values({
				...chunk,
				embedding: embedding?.embedding,
				embeddingModel: embedding?.model ?? null,
				embeddedAt: embedding ? now : null,
				createdAt: now,
				updatedAt: now
			})
			.onConflictDoUpdate({
				target: schema.sourceChunk.contentHash,
				set: {
					chunkText: chunk.chunkText,
					url: chunk.url,
					chapterId: chunk.chapterId,
					stepId: chunk.stepId,
					...(embedding
						? {
								embedding: embedding.embedding,
								embeddingModel: embedding.model,
								embeddedAt: now
							}
						: {}),
					updatedAt: now
				}
			});
	}

	return {
		documents: snapshot.documents.length,
		chunks: snapshot.chunks.length,
		embeddedChunks
	};
}

function sourceDocumentFromSource(explainerSlug: string, source: Source): SourceDocumentInput {
	return {
		id: sourceDocumentId(explainerSlug, source.id),
		sourceId: source.id,
		explainerSlug,
		short: source.short,
		full: source.full,
		url: source.url ?? null,
		year: source.year,
		contentHash: hashStable([explainerSlug, source.id, source.short, source.full, source.url ?? ''])
	};
}

function addChapterSourceChunks(
	chunks: Map<string, SourceChunkInput>,
	explainerSlug: string,
	chapter: Chapter,
	sources: Record<string, Source>
) {
	for (const sourceId of chapter.sources ?? []) {
		const source = sources[sourceId];
		if (!source) continue;
		addChunk(chunks, {
			sourceDocumentId: sourceDocumentId(explainerSlug, sourceId),
			sourceId,
			explainerSlug,
			chapterId: chapter.id,
			stepId: null,
			chunkKind: 'chapter_source',
			chunkText: source.full,
			url: source.url ?? null
		});
	}

	for (const step of chapter.steps) {
		for (const sourceId of sourceIdsFromStep(step)) {
			const source = sources[sourceId];
			if (!source) continue;
			addChunk(chunks, {
				sourceDocumentId: sourceDocumentId(explainerSlug, sourceId),
				sourceId,
				explainerSlug,
				chapterId: chapter.id,
				stepId: step.id,
				chunkKind: 'step_source',
				chunkText: [source.full, step.text].join('\nContext: '),
				url: source.url ?? null
			});
		}
	}
}

function sourceIdsFromStep(step: Step): string[] {
	const sourceIds = new Set<string>();
	if (step.stat?.sourceId) sourceIds.add(step.stat.sourceId);
	if (step.quote?.sourceId) sourceIds.add(step.quote.sourceId);
	const viz = step.viz as { sourceId?: unknown } | undefined;
	if (typeof viz?.sourceId === 'string') {
		sourceIds.add(viz.sourceId);
	}
	return Array.from(sourceIds);
}

function addChunk(
	chunks: Map<string, SourceChunkInput>,
	input: Omit<SourceChunkInput, 'id' | 'contentHash'>
) {
	const contentHash = hashStable([
		input.explainerSlug,
		input.sourceId,
		input.chapterId ?? '',
		input.stepId ?? '',
		input.chunkKind,
		input.chunkText,
		input.url ?? ''
	]);
	chunks.set(contentHash, {
		...input,
		id: `${input.sourceDocumentId}:${contentHash.slice(0, 16)}`,
		contentHash
	});
}

function sourceDocumentId(explainerSlug: string, sourceId: string): string {
	return `${explainerSlug}:${sourceId}`;
}

function hashStable(parts: string[]): string {
	return createHash('sha256').update(parts.join('\n')).digest('hex');
}
