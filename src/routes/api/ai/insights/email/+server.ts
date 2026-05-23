import { json, error } from '@sveltejs/kit';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '$lib/server/db';
import { getResendClient, getResendFromEmail } from '$lib/server/email/resend';
import { renderInsightSummaryEmail } from '$lib/server/email/insight-summary-email';
import type { RequestHandler } from './$types';

const emailRequestSchema = z.object({
	summaryId: z.string().min(1).optional()
});

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) error(401, 'Log in to email saved-insight summaries.');

	const parsed = emailRequestSchema.safeParse(await request.json().catch(() => ({})));
	if (!parsed.success) error(400, 'Invalid email request.');

	const [summary] = await db
		.select()
		.from(schema.insightSummary)
		.where(
			parsed.data.summaryId
				? and(
						eq(schema.insightSummary.userId, locals.user.id),
						eq(schema.insightSummary.id, parsed.data.summaryId)
					)
				: eq(schema.insightSummary.userId, locals.user.id)
		)
		.orderBy(desc(schema.insightSummary.createdAt))
		.limit(1);

	if (!summary) error(404, 'Generate a saved-insights summary before emailing it.');

	const email = renderInsightSummaryEmail({
		name: locals.user.name,
		explainerSlug: summary.explainerSlug,
		insightCount: summary.insightCount,
		summary: summary.summaryJson
	});

	const deliveryId = crypto.randomUUID();

	const resend = getResendClient();
	let result: Awaited<ReturnType<typeof resend.emails.send>>;
	try {
		result = await resend.emails.send({
			from: getResendFromEmail(),
			to: locals.user.email,
			subject: email.subject,
			html: email.html,
			text: email.text
		});
	} catch (err) {
		await db.insert(schema.insightEmailDelivery).values({
			id: deliveryId,
			userId: locals.user.id,
			summaryId: summary.id,
			toEmail: locals.user.email,
			status: 'failed',
			createdAt: new Date()
		});
		throw err;
	}

	if (result.error) {
		await db.insert(schema.insightEmailDelivery).values({
			id: deliveryId,
			userId: locals.user.id,
			summaryId: summary.id,
			toEmail: locals.user.email,
			status: 'failed',
			createdAt: new Date()
		});
		error(502, 'Resend could not send this email.');
	}

	const [delivery] = await db
		.insert(schema.insightEmailDelivery)
		.values({
			id: deliveryId,
			userId: locals.user.id,
			summaryId: summary.id,
			toEmail: locals.user.email,
			resendId: result.data?.id,
			status: 'sent',
			createdAt: new Date()
		})
		.returning();

	return json({ delivery });
};
