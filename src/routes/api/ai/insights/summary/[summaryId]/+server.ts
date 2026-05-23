import { json, error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '$lib/server/db';
import type { RequestHandler } from './$types';

const updateSummarySchema = z.object({
	title: z.string().min(3).max(90).optional(),
	overview: z.string().min(20).max(900).optional(),
	shareableSummary: z.string().min(20).max(700).optional()
});

export const PATCH: RequestHandler = async ({ locals, params, request }) => {
	if (!locals.user) error(401, 'Log in to edit saved-insight summaries.');

	const parsed = updateSummarySchema.safeParse(await request.json().catch(() => ({})));
	if (!parsed.success) error(400, 'Invalid recap update.');

	const [summary] = await db
		.select()
		.from(schema.insightSummary)
		.where(
			and(
				eq(schema.insightSummary.userId, locals.user.id),
				eq(schema.insightSummary.id, params.summaryId)
			)
		)
		.limit(1);

	if (!summary) error(404, 'Recap not found.');

	const nextSummaryJson = {
		...summary.summaryJson,
		...Object.fromEntries(
			Object.entries(parsed.data).filter(([, value]) => typeof value === 'string')
		)
	};

	const [updated] = await db
		.update(schema.insightSummary)
		.set({ summaryJson: nextSummaryJson })
		.where(
			and(
				eq(schema.insightSummary.userId, locals.user.id),
				eq(schema.insightSummary.id, params.summaryId)
			)
		)
		.returning();

	return json({ summary: updated });
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) error(401, 'Log in to delete saved-insight summaries.');

	const [deleted] = await db
		.delete(schema.insightSummary)
		.where(
			and(
				eq(schema.insightSummary.userId, locals.user.id),
				eq(schema.insightSummary.id, params.summaryId)
			)
		)
		.returning({ id: schema.insightSummary.id });

	if (!deleted) error(404, 'Recap not found.');

	return json({ ok: true });
};
