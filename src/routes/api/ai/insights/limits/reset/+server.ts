import { error, json } from '@sveltejs/kit';
import {
	canResetWeeklyLimits,
	getWeeklyUsageForUser,
	resetWeeklyUsageForUser
} from '$lib/server/ai/weekly-limits';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
	if (!locals.user) error(401, 'Log in to reset weekly limits.');
	if (!canResetWeeklyLimits(locals.user.email)) error(403, 'Only the owner can reset weekly limits.');

	await resetWeeklyUsageForUser(locals.user.id);
	const weeklyUsage = await getWeeklyUsageForUser(locals.user.id);

	return json({
		weeklyUsage: {
			...weeklyUsage,
			weekStart: weeklyUsage.weekStart.toISOString(),
			nextWeekStart: weeklyUsage.nextWeekStart.toISOString(),
			resetAt: weeklyUsage.resetAt?.toISOString() ?? null
		}
	});
};
