import { and, count, eq, gte, lt } from 'drizzle-orm';
import { db, schema } from '$lib/server/db';

export const WEEKLY_RECAP_LIMIT = 5;
export const WEEKLY_EMAIL_LIMIT = 5;
const DEFAULT_WEEKLY_LIMIT_OWNER_EMAILS = ['marc@duby.io', 'marc@thenewhumanitarian.org'];
const WEEKLY_LIMIT_OWNER_EMAILS = (
	process.env.PIXELPOETRY_OWNER_EMAILS?.split(',') ?? DEFAULT_WEEKLY_LIMIT_OWNER_EMAILS
)
	.map((email) => email.trim().toLowerCase())
	.filter(Boolean);

export function currentUsageWeek(now = new Date()) {
	const weekStart = new Date(now);
	const day = weekStart.getDay();
	const daysSinceMonday = (day + 6) % 7;
	weekStart.setDate(weekStart.getDate() - daysSinceMonday);
	weekStart.setHours(0, 0, 0, 0);

	const nextWeekStart = new Date(weekStart);
	nextWeekStart.setDate(nextWeekStart.getDate() + 7);

	return { weekStart, nextWeekStart };
}

export async function getWeeklyUsageForUser(userId: string, now = new Date()) {
	const { weekStart, nextWeekStart } = currentUsageWeek(now);
	const [reset] = await db
		.select()
		.from(schema.aiUsageReset)
		.where(and(eq(schema.aiUsageReset.userId, userId), eq(schema.aiUsageReset.weekStart, weekStart)))
		.limit(1);
	const countStart = reset?.resetAt && reset.resetAt > weekStart ? reset.resetAt : weekStart;
	const [recapUsage, emailUsage] = await Promise.all([
		db
			.select({ value: count() })
			.from(schema.insightSummary)
			.where(
				and(
					eq(schema.insightSummary.userId, userId),
					gte(schema.insightSummary.createdAt, countStart),
					lt(schema.insightSummary.createdAt, nextWeekStart)
				)
			),
		db
			.select({ value: count() })
			.from(schema.insightEmailDelivery)
			.where(
				and(
					eq(schema.insightEmailDelivery.userId, userId),
					eq(schema.insightEmailDelivery.status, 'sent'),
					gte(schema.insightEmailDelivery.createdAt, countStart),
					lt(schema.insightEmailDelivery.createdAt, nextWeekStart)
				)
			)
	]);

	const recapsUsed = recapUsage[0]?.value ?? 0;
	const emailsUsed = emailUsage[0]?.value ?? 0;

	return {
		weekStart,
		nextWeekStart,
		resetAt: reset?.resetAt ?? null,
		recapLimit: WEEKLY_RECAP_LIMIT,
		emailLimit: WEEKLY_EMAIL_LIMIT,
		recapsUsed,
		emailsUsed,
		recapsLeft: Math.max(0, WEEKLY_RECAP_LIMIT - recapsUsed),
		emailsLeft: Math.max(0, WEEKLY_EMAIL_LIMIT - emailsUsed)
	};
}

export function canResetWeeklyLimits(email: string | null | undefined): boolean {
	return email ? WEEKLY_LIMIT_OWNER_EMAILS.includes(email.toLowerCase()) : false;
}

export async function resetWeeklyUsageForUser(userId: string, now = new Date()) {
	const { weekStart } = currentUsageWeek(now);
	const [reset] = await db
		.insert(schema.aiUsageReset)
		.values({
			id: crypto.randomUUID(),
			userId,
			weekStart,
			resetAt: now
		})
		.onConflictDoUpdate({
			target: [schema.aiUsageReset.userId, schema.aiUsageReset.weekStart],
			set: { resetAt: now }
		})
		.returning();

	return reset;
}
