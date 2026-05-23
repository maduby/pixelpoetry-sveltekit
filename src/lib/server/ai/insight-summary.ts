import { createHash } from 'node:crypto';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import {
	MAX_RECAP_DATA_ROWS,
	MAX_RECAP_INPUT_CHARS,
	MAX_RECAP_TAKEAWAY_CHARS
} from '$lib/insights/recap-limits';
import { getAiModelConfig } from './provider';
import type {
	InsightSummaryJson,
	SavedInsightContentJson,
	SavedInsightContentKind
} from '$lib/server/db/schema';
import type { GroundingSource } from '$lib/server/sources/source-retrieval';

export const INSIGHT_SUMMARY_PROMPT_VERSION = 'saved-takeaways-summary-v3-concise-british';

export interface SummaryInputInsight {
	id: string;
	selectedText: string;
	contentKind?: SavedInsightContentKind;
	contentJson?: SavedInsightContentJson | null;
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

function boundedString(min: number, max: number) {
	return z
		.string()
		.transform((value) => {
			const trimmed = value.trim();
			if (trimmed.length <= max) return trimmed;
			return `${trimmed.slice(0, max - 1).trimEnd()}…`;
		})
		.pipe(z.string().min(min).max(max));
}

const summarySchema = z.object({
	title: boundedString(3, 80),
	overview: boundedString(20, 520),
	keyTakeaways: z.array(boundedString(8, 210)).min(3).max(5),
	memoryHooks: z.array(boundedString(6, 150)).min(2).max(3),
	shareableSummary: boundedString(20, 360),
	suggestedNextRead: boundedString(3, 180).optional(),
	sources: z
		.array(
			z.object({
				sourceId: boundedString(2, 120),
				short: boundedString(1, 180),
				url: boundedString(1, 600).optional(),
				support: boundedString(1, 200),
				insightIds: z.array(boundedString(1, 120)).min(1).max(12)
			})
		)
		.max(5)
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

function truncateText(value: string, max: number): string {
	const trimmed = value.trim().replace(/\s+/g, ' ');
	if (trimmed.length <= max) return trimmed;
	return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

function compactAsset(asset: SavedInsightContentJson | null | undefined) {
	if (!asset) return undefined;

	const compact: Record<string, unknown> = {};
	for (const key of [
		'label',
		'description',
		'sourceId',
		'sourceIds',
		'imageName',
		'alt',
		'caption',
		'credit',
		'chartType',
		'unit',
		'kind'
	]) {
		if (asset[key as keyof SavedInsightContentJson] !== undefined) {
			compact[key] = asset[key as keyof SavedInsightContentJson];
		}
	}

	if (Array.isArray(asset.data)) {
		compact.dataRowCount = asset.data.length;
		compact.dataPreview = asset.data.slice(0, MAX_RECAP_DATA_ROWS);
	}
	if (asset.csv) compact.csvAvailable = true;

	return compact;
}

function compactInsightsForPrompt(insights: SummaryInputInsight[]) {
	const passageBudget = Math.max(
		200,
		Math.min(MAX_RECAP_TAKEAWAY_CHARS, Math.floor(MAX_RECAP_INPUT_CHARS / insights.length))
	);

	return insights.map((insight) => {
		const passagePreview = truncateText(insight.selectedText, passageBudget);
		return {
			insightId: insight.id,
			contentKind: insight.contentKind ?? 'text',
			passagePreview,
			passageWasShortened: passagePreview.length < insight.selectedText.trim().length,
			asset: compactAsset(insight.contentJson),
			note: insight.note ? truncateText(insight.note, 500) : null,
			explainer: insight.explainerSlug,
			chapter: insight.chapterId,
			step: insight.stepId
		};
	});
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
	const compactedInsights = compactInsightsForPrompt(insights);
	const inputHash = hashInsightInput({
		promptVersion: INSIGHT_SUMMARY_PROMPT_VERSION,
		insights: compactedInsights,
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
		'Write in warm, concise British English.',
		'Use British spelling and phrasing where it matters, for example ageing, behaviour, programme, sceptical.',
		'The output is private to the logged-in reader.'
	].join(' ');
	const allowedSources = summarizeGroundingSources(groundingSources);
	const prompt = [
		'Create a personalised recap from these saved takeaways.',
		'Each passagePreview may be shortened from the full private saved takeaway. Use asset metadata and notes to preserve intent when text is clipped.',
		'Takeaways may be text, images, charts, stats, quotes, datasets, or sources. Treat visual/data takeaways as first-class reader interests, not as captions only.',
		'Use contentKind and contentJson to understand whether a takeaway came from prose, an image, a chart, source evidence, or downloadable data.',
		'Prioritise what the reader appears to care about based on selected text, visual/data context, and notes.',
		'Be concise: overview 2-3 sentences; keyTakeaways 3-5 bullets; memoryHooks 2-3 short hooks; shareableSummary 2 sentences maximum.',
		'Avoid duplication across sections. If an idea appears in the overview, do not repeat it in the same wording in the key takeaways or memory hooks.',
		'Merge repeated saved takeaways into one point. Do not list the same image, quote, statistic, or headline twice.',
		'Ignore obvious clipped fragments unless contentJson supplies enough context to repair them. Do not quote broken text fragments.',
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
		JSON.stringify(compactedInsights, null, 2)
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
