import { json, error } from '@sveltejs/kit';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '$lib/server/db';
import { hashText } from '$lib/server/ai/insight-summary';
import type { RequestHandler } from './$types';

const saveInsightSchema = z.object({
	explainerSlug: z.string().min(1).max(80),
	chapterId: z.string().min(1).max(120),
	stepId: z.string().min(1).max(120),
	selectedText: z.string().min(3).max(4000),
	surroundingText: z.string().min(3).max(12000),
	note: z.string().max(2000).optional().nullable()
});

export const GET: RequestHandler = async ({ locals, url }) => {
	if (!locals.user) error(401, 'Log in to view saved insights.');

	const explainerSlug = url.searchParams.get('explainer');
	const rows = await db
		.select()
		.from(schema.savedInsight)
		.where(
			explainerSlug
				? and(
						eq(schema.savedInsight.userId, locals.user.id),
						eq(schema.savedInsight.explainerSlug, explainerSlug)
					)
				: eq(schema.savedInsight.userId, locals.user.id)
		)
		.orderBy(desc(schema.savedInsight.createdAt))
		.catch((err: unknown) => {
			if (isMissingAiTableError(err)) {
				error(503, 'Saved takeaways are waiting on the database migration.');
			}
			throw err;
		});

	return json({ insights: rows });
};

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) error(401, 'Log in to save insights.');

	const parsed = saveInsightSchema.safeParse(await request.json());
	if (!parsed.success) error(400, 'Invalid saved insight payload.');

	const selectedText = parsed.data.selectedText.trim();
	const surroundingText = parsed.data.surroundingText.trim();
	const note = parsed.data.note?.trim() || null;
	const now = new Date();

	const row = {
		id: crypto.randomUUID(),
		userId: locals.user.id,
		explainerSlug: parsed.data.explainerSlug,
		chapterId: parsed.data.chapterId,
		stepId: parsed.data.stepId,
		selectedText,
		surroundingText,
		note,
		selectionHash: hashText(
			[
				locals.user.id,
				parsed.data.explainerSlug,
				parsed.data.chapterId,
				parsed.data.stepId,
				selectedText
			].join('\n')
		),
		sourceHash: hashText(
			[parsed.data.explainerSlug, parsed.data.chapterId, parsed.data.stepId, surroundingText].join(
				'\n'
			)
		),
		createdAt: now,
		updatedAt: now
	};

	const [saved] = await db
		.insert(schema.savedInsight)
		.values(row)
		.returning()
		.catch((err: unknown) => {
			if (isMissingAiTableError(err)) {
				error(503, 'Saved takeaways are waiting on the database migration.');
			}
			throw err;
		});
	return json({ insight: saved }, { status: 201 });
};

function isMissingAiTableError(err: unknown): boolean {
	const message = err instanceof Error ? err.message : String(err);
	return (
		message.includes('saved_insight') ||
		message.includes('insight_summary') ||
		message.includes('insight_email_delivery') ||
		(message.includes('relation') && message.includes('does not exist'))
	);
}
