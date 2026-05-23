import { redirect } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { db, schema } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		const redirectTo = `${url.pathname}${url.search}`;
		throw redirect(303, `/login?redirectTo=${encodeURIComponent(redirectTo)}`);
	}

	let migrationPending = false;
	const [insights, summaries, deliveries] = await Promise.all([
		db
			.select()
			.from(schema.savedInsight)
			.where(eq(schema.savedInsight.userId, locals.user.id))
			.orderBy(desc(schema.savedInsight.createdAt))
			.limit(20),
		db
			.select()
			.from(schema.insightSummary)
			.where(eq(schema.insightSummary.userId, locals.user.id))
			.orderBy(desc(schema.insightSummary.createdAt))
			.limit(5),
		db
			.select()
			.from(schema.insightEmailDelivery)
			.where(eq(schema.insightEmailDelivery.userId, locals.user.id))
			.orderBy(desc(schema.insightEmailDelivery.createdAt))
			.limit(5)
	]).catch((err: unknown) => {
		if (isMissingAiTableError(err)) {
			migrationPending = true;
			return [[], [], []] as const;
		}
		throw err;
	});

	return {
		user: {
			id: locals.user.id,
			name: locals.user.name,
			email: locals.user.email,
			image: locals.user.image
		},
		migrationPending,
		insights: insights.map((insight) => ({
			...insight,
			createdAt: insight.createdAt.toISOString(),
			updatedAt: insight.updatedAt.toISOString()
		})),
		summaries: summaries.map((summary) => ({
			...summary,
			createdAt: summary.createdAt.toISOString()
		})),
		deliveries: deliveries.map((delivery) => ({
			...delivery,
			createdAt: delivery.createdAt.toISOString()
		}))
	};
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
