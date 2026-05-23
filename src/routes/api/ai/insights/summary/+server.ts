import { json, error } from '@sveltejs/kit';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { MAX_RECAP_TAKEAWAYS } from '$lib/insights/recap-limits';
import { db, schema } from '$lib/server/db';
import { generateInsightSummary } from '$lib/server/ai/insight-summary';
import { isAiProviderConfigured } from '$lib/server/ai/provider';
import { getWeeklyUsageForUser, WEEKLY_RECAP_LIMIT } from '$lib/server/ai/weekly-limits';
import {
	attachSourcesToSummary,
	ensureSourceMatchesForInsights
} from '$lib/server/sources/source-retrieval';
import type { RequestHandler } from './$types';

const summaryRequestSchema = z.object({
	explainerSlug: z.string().min(1).max(80).optional(),
	insightIds: z.array(z.string().min(1).max(120)).min(1).max(MAX_RECAP_TAKEAWAYS).optional()
});

const MAX_RECAPS_PER_USER = 5;

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) error(401, 'Log in to generate saved-insight summaries.');
	if (!isAiProviderConfigured()) {
		error(503, 'AI recap generation needs provider credentials before it can run locally.');
	}

	const weeklyUsage = await getWeeklyUsageForUser(locals.user.id);
	if (weeklyUsage.recapsUsed >= WEEKLY_RECAP_LIMIT) {
		error(429, 'You have used all 5 recap generations for this week.');
	}

	const requestBody = await request.json().catch(() => ({}));
	if (
		requestBody &&
		typeof requestBody === 'object' &&
		'insightIds' in requestBody &&
		Array.isArray(requestBody.insightIds) &&
		requestBody.insightIds.length > MAX_RECAP_TAKEAWAYS
	) {
		error(400, `Choose up to ${MAX_RECAP_TAKEAWAYS} takeaways for one recap.`);
	}

	const parsed = summaryRequestSchema.safeParse(requestBody);
	if (!parsed.success) error(400, 'Invalid summary request.');

	const insights = await db
		.select()
		.from(schema.savedInsight)
		.where(
			and(
				eq(schema.savedInsight.userId, locals.user.id),
				parsed.data.explainerSlug
					? eq(schema.savedInsight.explainerSlug, parsed.data.explainerSlug)
					: undefined,
				parsed.data.insightIds ? inArray(schema.savedInsight.id, parsed.data.insightIds) : undefined
			)
		)
		.orderBy(desc(schema.savedInsight.createdAt));

	if (insights.length === 0) error(400, 'Save at least one insight before generating a summary.');
	if (parsed.data.insightIds && insights.length !== new Set(parsed.data.insightIds).size) {
		error(400, 'One or more selected takeaways could not be found.');
	}
	if (insights.length > MAX_RECAP_TAKEAWAYS) {
		error(400, `Choose up to ${MAX_RECAP_TAKEAWAYS} takeaways for one recap.`);
	}

	const sourceMatches = await ensureSourceMatchesForInsights(db, insights).catch((err: unknown) => {
		console.warn('Saved takeaways source grounding failed; generating recap without sources.', err);
		return [];
	});

	const generated = await generateInsightSummary(insights, sourceMatches).catch((err: unknown) => {
		console.error('Saved takeaways summary generation failed', err);
		error(503, 'The AI provider did not complete the recap. Try again in a moment.');
	});
	const explainerSlug =
		parsed.data.explainerSlug ??
		(new Set(insights.map((insight) => insight.explainerSlug)).size === 1
			? insights[0].explainerSlug
			: 'all');
	const [saved] = await db
		.insert(schema.insightSummary)
		.values({
			id: crypto.randomUUID(),
			userId: locals.user.id,
			explainerSlug,
			summaryJson: generated.summary,
			model: generated.model,
			provider: generated.provider,
			promptVersion: generated.promptVersion,
			inputHash: generated.inputHash,
			insightCount: insights.length,
			insightIds: insights.map((insight) => insight.id),
			createdAt: new Date()
		})
		.returning();
	await attachSourcesToSummary(db, saved.id, sourceMatches).catch((err: unknown) => {
		console.warn('Saved takeaways summary-source attachment failed', err);
	});
	await pruneOldSummaries(locals.user.id).catch((err: unknown) => {
		console.warn('Saved takeaways summary pruning failed', err);
	});

	return json({
		summary: saved,
		provider: generated.provider,
		model: generated.model,
		promptVersion: generated.promptVersion
	});
};

async function pruneOldSummaries(userId: string): Promise<void> {
	const oldSummaries = await db
		.select({ id: schema.insightSummary.id })
		.from(schema.insightSummary)
		.where(eq(schema.insightSummary.userId, userId))
		.orderBy(desc(schema.insightSummary.createdAt))
		.limit(100)
		.offset(MAX_RECAPS_PER_USER);

	if (oldSummaries.length === 0) return;

	await db.delete(schema.insightSummary).where(
		and(
			eq(schema.insightSummary.userId, userId),
			inArray(
				schema.insightSummary.id,
				oldSummaries.map((summary) => summary.id)
			)
		)
	);
}
