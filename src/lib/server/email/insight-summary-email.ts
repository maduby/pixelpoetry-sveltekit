import type { InsightSummaryJson } from '$lib/server/db/schema';

export interface InsightSummaryEmailInput {
	name: string;
	summary: InsightSummaryJson;
	insightCount: number;
	explainerSlug: string;
}

function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function list(items: string[]): string {
	return items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
}

export function renderInsightSummaryEmail(input: InsightSummaryEmailInput): {
	subject: string;
	html: string;
	text: string;
} {
	const title = input.summary.title || 'Your Pixel Poetry saved-insights recap';
	const subject = `${title} | Pixel Poetry`;
	const preheader = `A private recap of ${input.insightCount} saved highlight${
		input.insightCount === 1 ? '' : 's'
	}.`;

	const html = `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>${escapeHtml(subject)}</title>
	</head>
	<body style="margin:0;background:#fef9ef;color:#0a0a0a;font-family:Arial,sans-serif;">
		<div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preheader)}</div>
		<main style="max-width:680px;margin:0 auto;padding:32px 20px;">
			<p style="margin:0 0 12px;text-transform:uppercase;letter-spacing:.12em;font-size:12px;font-weight:700;color:#8a5a00;">Pixel Poetry</p>
			<h1 style="margin:0 0 18px;font-size:34px;line-height:1.08;font-family:Georgia,serif;">${escapeHtml(
				title
			)}</h1>
			<p style="font-size:17px;line-height:1.65;margin:0 0 24px;">Hi ${escapeHtml(input.name)},</p>
			<p style="font-size:17px;line-height:1.65;margin:0 0 24px;">${escapeHtml(
				input.summary.overview
			)}</p>
			<h2 style="font-size:20px;margin:30px 0 12px;font-family:Georgia,serif;">Key takeaways</h2>
			<ul style="font-size:16px;line-height:1.6;padding-left:22px;">${list(input.summary.keyTakeaways)}</ul>
			<h2 style="font-size:20px;margin:30px 0 12px;font-family:Georgia,serif;">Memory hooks</h2>
			<ul style="font-size:16px;line-height:1.6;padding-left:22px;">${list(input.summary.memoryHooks)}</ul>
			<h2 style="font-size:20px;margin:30px 0 12px;font-family:Georgia,serif;">Shareable summary</h2>
			<p style="font-size:16px;line-height:1.65;margin:0 0 24px;">${escapeHtml(
				input.summary.shareableSummary
			)}</p>
			${
				input.summary.suggestedNextRead
					? `<p style="font-size:15px;line-height:1.6;margin:28px 0 0;color:#444;"><strong>Next:</strong> ${escapeHtml(
							input.summary.suggestedNextRead
						)}</p>`
					: ''
			}
			<p style="font-size:13px;line-height:1.6;margin:34px 0 0;color:#666;">This private email was sent to you because you requested a recap from your Pixel Poetry account.</p>
		</main>
	</body>
</html>`;

	const text = [
		`Pixel Poetry: ${title}`,
		`Hi ${input.name},`,
		input.summary.overview,
		'Key takeaways:',
		...input.summary.keyTakeaways.map((item) => `- ${item}`),
		'Memory hooks:',
		...input.summary.memoryHooks.map((item) => `- ${item}`),
		'Shareable summary:',
		input.summary.shareableSummary,
		input.summary.suggestedNextRead ? `Next: ${input.summary.suggestedNextRead}` : '',
		'This private email was sent to you because you requested a recap from your Pixel Poetry account.'
	]
		.filter(Boolean)
		.join('\n\n');

	return { subject, html, text };
}

export function renderSmokeEmail(name: string): { subject: string; html: string; text: string } {
	const subject = 'Pixel Poetry email check';
	const safeName = escapeHtml(name);
	return {
		subject,
		html: `<p>Hi ${safeName},</p><p>Your Pixel Poetry Resend setup is working.</p>`,
		text: `Hi ${name},\n\nYour Pixel Poetry Resend setup is working.`
	};
}
