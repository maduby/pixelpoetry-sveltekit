import { and, eq, inArray, isNull, or, sql } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { embedSourceText, getEmbeddingConfig } from '$lib/server/ai/embeddings';
import type { db as appDb } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';

type DbClient = typeof appDb;
type SavedInsightRow = typeof schema.savedInsight.$inferSelect;

export interface GroundingSource {
	insightId: string;
	sourceChunkId: string;
	sourceDocumentId: string;
	sourceId: string;
	short: string;
	full: string;
	url: string | null;
	chunkText: string;
	score: number;
	matchReason: string;
}

interface CandidateSource {
	sourceChunkId: string;
	sourceDocumentId: string;
	sourceId: string;
	short: string;
	full: string;
	url: string | null;
	chunkText: string;
	chapterId: string | null;
	stepId: string | null;
	score?: number;
}

const MAX_GROUNDING_SOURCES_PER_INSIGHT = 4;

export async function matchAndStoreSourcesForInsight(
	db: DbClient,
	insight: SavedInsightRow
): Promise<GroundingSource[]> {
	const matches = await matchSourcesForInsight(db, insight);
	const now = new Date();

	for (const match of matches) {
		await db
			.insert(schema.savedInsightSourceMatch)
			.values({
				id: crypto.randomUUID(),
				savedInsightId: insight.id,
				sourceChunkId: match.sourceChunkId,
				sourceDocumentId: match.sourceDocumentId,
				score: match.score,
				matchReason: match.matchReason,
				createdAt: now
			})
			.onConflictDoUpdate({
				target: [
					schema.savedInsightSourceMatch.savedInsightId,
					schema.savedInsightSourceMatch.sourceChunkId
				],
				set: {
					score: match.score,
					matchReason: match.matchReason
				}
			});
	}

	return matches;
}

export async function ensureSourceMatchesForInsights(
	db: DbClient,
	insights: SavedInsightRow[]
): Promise<GroundingSource[]> {
	if (insights.length === 0) return [];

	const existing = await loadGroundingSourcesForInsightIds(
		db,
		insights.map((insight) => insight.id)
	);
	const insightIdsWithMatches = new Set(existing.map((match) => match.insightId));
	const missing = insights.filter((insight) => !insightIdsWithMatches.has(insight.id));

	const generated: GroundingSource[] = [];
	for (const insight of missing) {
		generated.push(...(await matchAndStoreSourcesForInsight(db, insight)));
	}

	return [...existing, ...generated];
}

export async function attachSourcesToSummary(
	db: DbClient,
	summaryId: string,
	sources: GroundingSource[]
): Promise<void> {
	const bestByChunk = bestSourceByChunk(sources);
	const now = new Date();

	for (const source of bestByChunk.values()) {
		await db
			.insert(schema.insightSummarySource)
			.values({
				id: crypto.randomUUID(),
				summaryId,
				sourceChunkId: source.sourceChunkId,
				sourceDocumentId: source.sourceDocumentId,
				score: source.score,
				createdAt: now
			})
			.onConflictDoNothing();
	}
}

async function matchSourcesForInsight(
	db: DbClient,
	insight: SavedInsightRow
): Promise<GroundingSource[]> {
	const embeddedMatches = await matchSourcesWithEmbeddings(db, insight).catch((error: unknown) => {
		console.warn('Source embedding retrieval failed; falling back to lexical retrieval.', error);
		return [];
	});
	if (embeddedMatches.length > 0) return embeddedMatches;

	return matchSourcesLexically(db, insight);
}

async function matchSourcesWithEmbeddings(
	db: DbClient,
	insight: SavedInsightRow
): Promise<GroundingSource[]> {
	const embeddingEnv = env as Record<string, string | undefined>;
	const embeddingConfig = getEmbeddingConfig(embeddingEnv);
	if (!embeddingConfig.enabled) return [];

	const embedded = await embedSourceText(insight.selectedText, embeddingEnv);
	if (!embedded) return [];

	const vectorLiteral = `[${embedded.embedding.join(',')}]`;
	const result = await db.execute(sql<CandidateSource>`
		select
			${schema.sourceChunk.id} as "sourceChunkId",
			${schema.sourceDocument.id} as "sourceDocumentId",
			${schema.sourceDocument.sourceId} as "sourceId",
			${schema.sourceDocument.short} as "short",
			${schema.sourceDocument.full} as "full",
			${schema.sourceDocument.url} as "url",
			${schema.sourceChunk.chunkText} as "chunkText",
			${schema.sourceChunk.chapterId} as "chapterId",
			${schema.sourceChunk.stepId} as "stepId",
			1 - (${schema.sourceChunk.embedding} <=> ${vectorLiteral}::vector) as "score"
		from ${schema.sourceChunk}
		inner join ${schema.sourceDocument}
			on ${schema.sourceDocument.id} = ${schema.sourceChunk.sourceDocumentId}
		where ${schema.sourceChunk.explainerSlug} = ${insight.explainerSlug}
			and ${schema.sourceChunk.embedding} is not null
		order by ${schema.sourceChunk.embedding} <=> ${vectorLiteral}::vector
		limit ${MAX_GROUNDING_SOURCES_PER_INSIGHT * 3}
	`);

	return rankCandidates(result.rows as unknown as CandidateSource[], insight, 'embedding').slice(
		0,
		MAX_GROUNDING_SOURCES_PER_INSIGHT
	);
}

async function matchSourcesLexically(
	db: DbClient,
	insight: SavedInsightRow
): Promise<GroundingSource[]> {
	const candidates = await db
		.select({
			sourceChunkId: schema.sourceChunk.id,
			sourceDocumentId: schema.sourceDocument.id,
			sourceId: schema.sourceDocument.sourceId,
			short: schema.sourceDocument.short,
			full: schema.sourceDocument.full,
			url: schema.sourceDocument.url,
			chunkText: schema.sourceChunk.chunkText,
			chapterId: schema.sourceChunk.chapterId,
			stepId: schema.sourceChunk.stepId
		})
		.from(schema.sourceChunk)
		.innerJoin(
			schema.sourceDocument,
			eq(schema.sourceDocument.id, schema.sourceChunk.sourceDocumentId)
		)
		.where(
			and(
				eq(schema.sourceChunk.explainerSlug, insight.explainerSlug),
				or(
					isNull(schema.sourceChunk.chapterId),
					eq(schema.sourceChunk.chapterId, insight.chapterId),
					eq(schema.sourceChunk.stepId, insight.stepId)
				)
			)
		);

	return rankCandidates(candidates, insight, 'lexical').slice(0, MAX_GROUNDING_SOURCES_PER_INSIGHT);
}

async function loadGroundingSourcesForInsightIds(
	db: DbClient,
	insightIds: string[]
): Promise<GroundingSource[]> {
	if (insightIds.length === 0) return [];

	return db
		.select({
			insightId: schema.savedInsightSourceMatch.savedInsightId,
			sourceChunkId: schema.sourceChunk.id,
			sourceDocumentId: schema.sourceDocument.id,
			sourceId: schema.sourceDocument.sourceId,
			short: schema.sourceDocument.short,
			full: schema.sourceDocument.full,
			url: schema.sourceDocument.url,
			chunkText: schema.sourceChunk.chunkText,
			score: schema.savedInsightSourceMatch.score,
			matchReason: schema.savedInsightSourceMatch.matchReason
		})
		.from(schema.savedInsightSourceMatch)
		.innerJoin(
			schema.sourceChunk,
			eq(schema.sourceChunk.id, schema.savedInsightSourceMatch.sourceChunkId)
		)
		.innerJoin(
			schema.sourceDocument,
			eq(schema.sourceDocument.id, schema.savedInsightSourceMatch.sourceDocumentId)
		)
		.where(inArray(schema.savedInsightSourceMatch.savedInsightId, insightIds));
}

function rankCandidates(
	candidates: CandidateSource[],
	insight: SavedInsightRow,
	matchReason: 'embedding' | 'lexical'
): GroundingSource[] {
	const passageTokens = tokenize(`${insight.selectedText} ${insight.surroundingText}`);
	const scored = candidates
		.map((candidate) => {
			const lexicalScore = lexicalScoreForTokens(passageTokens, candidate.chunkText);
			const contextBoost =
				candidate.stepId === insight.stepId
					? 0.28
					: candidate.chapterId === insight.chapterId
						? 0.16
						: 0;
			const baseScore = typeof candidate.score === 'number' ? candidate.score : lexicalScore;
			return {
				...candidate,
				insightId: insight.id,
				score: Math.max(0, Math.min(1, baseScore + contextBoost + lexicalScore * 0.18)),
				matchReason
			};
		})
		.filter((candidate) => candidate.score > 0.08)
		.sort((a, b) => b.score - a.score);

	const bestBySource = new Map<string, GroundingSource>();
	for (const candidate of scored) {
		const existing = bestBySource.get(candidate.sourceDocumentId);
		if (!existing || candidate.score > existing.score) {
			bestBySource.set(candidate.sourceDocumentId, candidate);
		}
	}

	return Array.from(bestBySource.values()).sort((a, b) => b.score - a.score);
}

function bestSourceByChunk(sources: GroundingSource[]): Map<string, GroundingSource> {
	const best = new Map<string, GroundingSource>();
	for (const source of sources) {
		const existing = best.get(source.sourceChunkId);
		if (!existing || source.score > existing.score) {
			best.set(source.sourceChunkId, source);
		}
	}
	return best;
}

function lexicalScoreForTokens(passageTokens: Set<string>, chunkText: string): number {
	const chunkTokens = tokenize(chunkText);
	if (passageTokens.size === 0 || chunkTokens.size === 0) return 0;

	let overlap = 0;
	for (const token of passageTokens) {
		if (chunkTokens.has(token)) overlap += 1;
	}

	return overlap / Math.sqrt(passageTokens.size * chunkTokens.size);
}

function tokenize(text: string): Set<string> {
	return new Set(
		text
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, ' ')
			.split(/\s+/)
			.map((token) => token.replace(/^-+|-+$/g, ''))
			.filter((token) => token.length > 3)
	);
}
