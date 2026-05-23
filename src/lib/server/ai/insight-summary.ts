import { createHash } from 'node:crypto';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { getAiModelConfig } from './provider';
import type { InsightSummaryJson } from '$lib/server/db/schema';
import type { GroundingSource } from '$lib/server/sources/source-retrieval';

export const INSIGHT_SUMMARY_PROMPT_VERSION = 'saved-takeaways-summary-v2-grounded';

export interface SummaryInputInsight {
	id: string;
	selectedText: string;
	note: string | null;
	explainerSlug: string;
	chapterId: string;
	stepId: string;
	createdAt: Date;
}

export interface GeneratedInsightSummary {
	summary: InsightSummaryJson;
	provider: string;
	model: string;
	promptVersion: string;
	inputHash: string;
}

const summarySchema = z.object({
	title: z.string().min(3).max(90),
	overview: z.string().min(20).max(900),
	keyTakeaways: z.array(z.string().min(8).max(240)).min(3).max(7),
	memoryHooks: z.array(z.string().min(6).max(180)).min(2).max(6),
	shareableSummary: z.string().min(20).max(700),
	suggestedNextRead: z.string().min(3).max(180).optional(),
	sources: z
		.array(
			z.object({
				sourceId: z.string().min(2).max(120),
				short: z.string().min(1).max(180),
				url: z.string().max(600).optional(),
				support: z.string().min(1).max(260),
				insightIds: z.array(z.string().min(1).max(120)).min(1).max(12)
			})
		)
		.max(8)
		.optional()
});

function extractJsonObject(text: string): unknown {
	const cleaned = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

	try {
		return JSON.parse(cleaned);
	} catch {
		const firstBrace = cleaned.indexOf('{');
		const lastBrace = cleaned.lastIndexOf('}');

		if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
			throw new Error('AI response did not include a JSON object.');
		}

		return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
	}
}

function coerceStringList(value: unknown): unknown {
	if (Array.isArray(value)) return value;
	if (typeof value !== 'string') return value;

	const trimmed = value.trim();
	if (!trimmed) return [];

	return trimmed
		.split(/\n+|(?:^|\s)(?:[-*]|\d+[.)])\s+|;\s+/)
		.map((item) => item.replace(/^["'•\s-]+|["'\s.]+$/g, '').trim())
		.filter(Boolean);
}

function normalizeSummaryShape(value: unknown): unknown {
	if (value == null || typeof value !== 'object' || Array.isArray(value)) return value;

	const summary = { ...(value as Record<string, unknown>) };
	summary.keyTakeaways = coerceStringList(summary.keyTakeaways);
	summary.memoryHooks = coerceStringList(summary.memoryHooks);
	if (Array.isArray(summary.sources)) {
		summary.sources = summary.sources.map((source) => {
			if (source == null || typeof source !== 'object' || Array.isArray(source)) return source;
			const normalized = { ...(source as Record<string, unknown>) };
			normalized.insightIds = coerceStringList(normalized.insightIds);
			return normalized;
		});
	}

	return summary;
}

export function hashInsightInput(value: unknown): string {
	return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

export function hashText(value: string): string {
	return createHash('sha256').update(value).digest('hex');
}

export async function generateInsightSummary(
	insights: SummaryInputInsight[],
	groundingSources: GroundingSource[] = []
): Promise<GeneratedInsightSummary> {
	if (insights.length === 0) {
		throw new Error('Cannot generate a summary without saved insights.');
	}

	const modelConfig = getAiModelConfig();
	const inputHash = hashInsightInput({
		promptVersion: INSIGHT_SUMMARY_PROMPT_VERSION,
		insights: insights.map((insight) => ({
			selectedText: insight.selectedText,
			note: insight.note,
			explainerSlug: insight.explainerSlug,
			chapterId: insight.chapterId,
			stepId: insight.stepId
		})),
		sources: groundingSources.map((source) => ({
			sourceChunkId: source.sourceChunkId,
			sourceId: source.sourceId,
			insightId: source.insightId,
			score: source.score
		}))
	});

	const system = [
		'You help Pixel Poetry readers remember the takeaways they chose to save.',
		'Use only the saved takeaway passages and reader notes provided.',
		'Use only the allowed source snippets when grounding or citing evidence.',
		'Do not invent facts, citations, source IDs, URLs, or claims beyond the provided text.',
		'Write in a warm, concise editorial voice.',
		'The output is private to the logged-in reader.'
	].join(' ');
	const allowedSources = summarizeGroundingSources(groundingSources);
	const prompt = [
		'Create a personalised recap from these saved takeaways.',
		'Prioritise what the reader appears to care about based on both selected text and notes.',
		'When a source is useful, cite it only by including it in the `sources` array.',
		'Only use source IDs from allowedSources. If no source snippet supports a point, leave sources empty rather than guessing.',
		'Do not mention analytics, prompts, models, or implementation details.',
		'Return only a JSON object with this shape:',
		'{"title":"string","overview":"string","keyTakeaways":["string"],"memoryHooks":["string"],"shareableSummary":"string","suggestedNextRead":"string","sources":[{"sourceId":"string","short":"string","url":"string","support":"string","insightIds":["string"]}]}',
		'Both keyTakeaways and memoryHooks must be JSON arrays of strings, never a single string.',
		'',
		'allowedSources:',
		JSON.stringify(allowedSources, null, 2),
		'',
		'savedTakeaways:',
		JSON.stringify(
			insights.map((insight) => ({
				insightId: insight.id,
				passage: insight.selectedText,
				note: insight.note,
				explainer: insight.explainerSlug,
				chapter: insight.chapterId,
				step: insight.stepId
			})),
			null,
			2
		)
	].join('\n');

	const summary =
		modelConfig.provider === 'minimax'
			? summarySchema.parse(
					normalizeSummaryShape(
						extractJsonObject(
							(
								await generateText({
									model: modelConfig.modelRef,
									system,
									prompt,
									maxOutputTokens: 1800,
									providerOptions: { minimax: { reasoning_split: true } }
								})
							).text
						)
					)
				)
			: (
					await generateText({
						model: modelConfig.modelRef,
						output: Output.object({ schema: summarySchema }),
						system,
						prompt
					})
				).output;

	return {
		summary,
		provider: modelConfig.provider,
		model: modelConfig.model,
		promptVersion: INSIGHT_SUMMARY_PROMPT_VERSION,
		inputHash
	};
}

function summarizeGroundingSources(sources: GroundingSource[]) {
	const seen = new Set<string>();
	return sources
		.sort((a, b) => b.score - a.score)
		.filter((source) => {
			const key = `${source.insightId}:${source.sourceDocumentId}`;
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		})
		.slice(0, 12)
		.map((source) => ({
			insightId: source.insightId,
			sourceId: source.sourceId,
			short: source.short,
			url: source.url ?? undefined,
			snippet: source.chunkText.slice(0, 700),
			score: Number(source.score.toFixed(3))
		}));
}
