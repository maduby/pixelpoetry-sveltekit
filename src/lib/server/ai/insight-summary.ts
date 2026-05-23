import { createHash } from 'node:crypto';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { getAiModelConfig } from './provider';
import type { InsightSummaryJson } from '$lib/server/db/schema';

export const INSIGHT_SUMMARY_PROMPT_VERSION = 'saved-takeaways-summary-v1';

export interface SummaryInputInsight {
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
	suggestedNextRead: z.string().min(3).max(180).optional()
});

export function hashInsightInput(value: unknown): string {
	return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

export function hashText(value: string): string {
	return createHash('sha256').update(value).digest('hex');
}

export async function generateInsightSummary(
	insights: SummaryInputInsight[]
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
		}))
	});

	const { output } = await generateText({
		model: modelConfig.modelRef,
		output: Output.object({ schema: summarySchema }),
		system: [
			'You help Pixel Poetry readers remember the takeaways they chose to save.',
			'Use only the saved takeaway passages and reader notes provided.',
			'Do not invent facts, citations, or claims beyond the provided text.',
			'Write in a warm, concise editorial voice.',
			'The output is private to the logged-in reader.'
		].join(' '),
		prompt: [
			'Create a personalised recap from these saved takeaways.',
			'Prioritise what the reader appears to care about based on both selected text and notes.',
			'Do not mention analytics, prompts, models, or implementation details.',
			'',
			JSON.stringify(
				insights.map((insight) => ({
					passage: insight.selectedText,
					note: insight.note,
					explainer: insight.explainerSlug,
					chapter: insight.chapterId,
					step: insight.stepId
				})),
				null,
				2
			)
		].join('\n')
	});

	return {
		summary: output,
		provider: modelConfig.provider,
		model: modelConfig.model,
		promptVersion: INSIGHT_SUMMARY_PROMPT_VERSION,
		inputHash
	};
}
