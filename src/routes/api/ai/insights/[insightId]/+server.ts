import { error, json } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db, schema } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) error(401, 'Log in to delete saved takeaways.');

	const [deleted] = await db
		.delete(schema.savedInsight)
		.where(
			and(
				eq(schema.savedInsight.id, params.insightId),
				eq(schema.savedInsight.userId, locals.user.id)
			)
		)
		.returning({ id: schema.savedInsight.id });

	if (!deleted) error(404, 'Takeaway not found.');

	return json({ ok: true });
};
