import { json, error } from '@sveltejs/kit';
import { db, schema } from '$lib/server/db';
import { getResendClient, getResendFromEmail } from '$lib/server/email/resend';
import { renderSmokeEmail } from '$lib/server/email/insight-summary-email';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
	if (!locals.user) error(401, 'Log in to test email delivery.');

	const email = renderSmokeEmail(locals.user.name);
	const deliveryId = crypto.randomUUID();

	const result = await getResendClient().emails.send({
		from: getResendFromEmail(),
		to: locals.user.email,
		subject: email.subject,
		html: email.html,
		text: email.text
	});

	if (result.error) {
		await db.insert(schema.insightEmailDelivery).values({
			id: deliveryId,
			userId: locals.user.id,
			toEmail: locals.user.email,
			status: 'failed',
			createdAt: new Date()
		});
		error(502, 'Resend could not send the smoke-test email.');
	}

	const [delivery] = await db
		.insert(schema.insightEmailDelivery)
		.values({
			id: deliveryId,
			userId: locals.user.id,
			toEmail: locals.user.email,
			resendId: result.data?.id,
			status: 'sent',
			createdAt: new Date()
		})
		.returning();

	return json({ delivery });
};
