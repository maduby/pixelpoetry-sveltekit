import { redirect } from '@sveltejs/kit';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { db, schema } from '$lib/server/db';
import { isAiProviderConfigured } from '$lib/server/ai/provider';
import { canResetWeeklyLimits, getWeeklyUsageForUser } from '$lib/server/ai/weekly-limits';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		const redirectTo = `${url.pathname}${url.search}`;
		throw redirect(303, `/login?redirectTo=${encodeURIComponent(redirectTo)}`);
	}

	let migrationPending = false;
	const [insights, summaries, weeklyUsage] = await Promise.all([
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
		getWeeklyUsageForUser(locals.user.id)
	]).catch((err: unknown) => {
		if (isMissingAiTableError(err)) {
			migrationPending = true;
			return [
				[],
				[],
				{
					weekStart: new Date(),
					nextWeekStart: new Date(),
					recapLimit: 5,
					emailLimit: 5,
					recapsUsed: 0,
					emailsUsed: 0,
					recapsLeft: 0,
					emailsLeft: 0,
					resetAt: null
				}
			] as const;
		}
		throw err;
	});
	const summaryIds = summaries.map((summary) => summary.id);
	const deliveries =
		summaryIds.length && !migrationPending
			? await db
					.select()
					.from(schema.insightEmailDelivery)
					.where(
						and(
							eq(schema.insightEmailDelivery.userId, locals.user.id),
							inArray(schema.insightEmailDelivery.summaryId, summaryIds)
						)
					)
					.orderBy(desc(schema.insightEmailDelivery.createdAt))
			: [];
	const summaryInsightIds = Array.from(
		new Set(summaries.flatMap((summary) => summary.insightIds ?? []))
	);
	const summaryInsights =
		summaryInsightIds.length && !migrationPending
			? await db
					.select()
					.from(schema.savedInsight)
					.where(
						and(
							eq(schema.savedInsight.userId, locals.user.id),
							inArray(schema.savedInsight.id, summaryInsightIds)
						)
					)
			: [];
	const summaryInsightById = new Map(summaryInsights.map((insight) => [insight.id, insight]));
	const summaryInsightsBySummaryId = Object.fromEntries(
		summaries.map((summary) => [
			summary.id,
			(summary.insightIds ?? [])
				.map((id) => summaryInsightById.get(id))
				.filter((insight) => insight != null)
				.map((insight) => ({
					...insight,
					createdAt: insight.createdAt.toISOString(),
					updatedAt: insight.updatedAt.toISOString()
				}))
		])
	);

	return {
		user: {
			id: locals.user.id,
			name: locals.user.name,
			email: locals.user.email,
			image: locals.user.image
		},
		migrationPending,
		aiRecapConfigured: isAiProviderConfigured(),
		weeklyUsage: {
			...weeklyUsage,
			weekStart: weeklyUsage.weekStart.toISOString(),
			nextWeekStart: weeklyUsage.nextWeekStart.toISOString(),
			resetAt: weeklyUsage.resetAt?.toISOString() ?? null
		},
		canResetWeeklyLimits: canResetWeeklyLimits(locals.user.email),
		insights: insights.map((insight) => ({
			...insight,
			createdAt: insight.createdAt.toISOString(),
			updatedAt: insight.updatedAt.toISOString()
		})),
		summaries: summaries.map((summary) => ({
			...summary,
			createdAt: summary.createdAt.toISOString()
		})),
		summaryInsightsBySummaryId,
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
		message.includes('source_document') ||
		message.includes('source_chunk') ||
		message.includes('saved_insight_source_match') ||
		message.includes('insight_summary_source') ||
		message.includes('ai_usage_reset') ||
		(message.includes('relation') && message.includes('does not exist'))
	);
}
