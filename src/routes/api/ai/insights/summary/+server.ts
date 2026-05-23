import { json, error } from '@sveltejs/kit';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '$lib/server/db';
import { generateInsightSummary } from '$lib/server/ai/insight-summary';
import type { RequestHandler } from './$types';

const summaryRequestSchema = z.object({
	explainerSlug: z.string().min(1).max(80).optional()
});

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) error(401, 'Log in to generate saved-insight summaries.');

	const parsed = summaryRequestSchema.safeParse(await request.json().catch(() => ({})));
	if (!parsed.success) error(400, 'Invalid summary request.');

	const insights = await db
		.select()
		.from(schema.savedInsight)
		.where(
			parsed.data.explainerSlug
				? and(
						eq(schema.savedInsight.userId, locals.user.id),
						eq(schema.savedInsight.explainerSlug, parsed.data.explainerSlug)
					)
				: eq(schema.savedInsight.userId, locals.user.id)
		)
		.orderBy(desc(schema.savedInsight.createdAt));

	if (insights.length === 0) error(400, 'Save at least one insight before generating a summary.');

	const generated = await generateInsightSummary(insights);
	const [saved] = await db
		.insert(schema.insightSummary)
		.values({
			id: crypto.randomUUID(),
			userId: locals.user.id,
			explainerSlug: parsed.data.explainerSlug ?? 'all',
			summaryJson: generated.summary,
			model: generated.model,
			provider: generated.provider,
			promptVersion: generated.promptVersion,
			inputHash: generated.inputHash,
			insightCount: insights.length,
			createdAt: new Date()
		})
		.returning();

	return json({
		summary: saved,
		provider: generated.provider,
		model: generated.model,
		promptVersion: generated.promptVersion
	});
};
