import type { InsightSummaryJson } from '$lib/server/db/schema';

export interface InsightSummaryEmailInput {
	name: string;
	summary: InsightSummaryJson;
	insightCount: number;
	explainerSlug: string;
	siteUrl: string;
	sourceLinks?: Array<{
		label: string;
		href: string;
		excerpt: string;
		image?: {
			src: string;
			alt: string;
			caption?: string;
			credit?: string;
			width?: number;
			height?: number;
		};
	}>;
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
	return items
		.map(
			(item) => `<tr>
				<td style="width:22px;padding:0 0 12px;vertical-align:top;">
					<span style="display:inline-block;width:7px;height:7px;margin-top:8px;border-radius:999px;background:#e7362d;"></span>
				</td>
				<td style="padding:0 0 12px;font-size:16px;line-height:1.58;color:#2f2f2f;">${escapeHtml(item)}</td>
			</tr>`
		)
		.join('');
}

function linkList(items: NonNullable<InsightSummaryEmailInput['sourceLinks']>): string {
	return items
		.map((item) => {
			const image = item.image
				? `<div style="margin:0 0 12px;">
						<img src="${escapeHtml(item.image.src)}" alt="${escapeHtml(
							item.image.alt
						)}" width="${item.image.width ?? 640}" style="display:block;width:100%;max-width:100%;height:auto;border:1px solid #e8dfd2;border-radius:12px;background:#f6efe3;" />
						${
							item.image.caption || item.image.credit
								? `<div style="margin-top:7px;font-size:12px;line-height:1.45;color:#777;">${[
										item.image.caption,
										item.image.credit
									]
										.filter(Boolean)
										.map((value) => escapeHtml(value ?? ''))
										.join(' ')}</div>`
								: ''
						}
					</div>`
				: '';
			return `<tr>
				<td style="padding:0 0 14px;">
					${image}
					<a href="${escapeHtml(item.href)}" style="color:#0a0a0a;font-weight:700;text-decoration:underline;">${escapeHtml(
						item.label
					)}</a>
					<div style="margin-top:5px;font-size:14px;line-height:1.55;color:#686868;">${escapeHtml(
						item.excerpt
					)}</div>
				</td>
			</tr>`;
		})
		.join('');
}

function sourceList(items: NonNullable<InsightSummaryJson['sources']>): string {
	return items
		.map((item) => {
			const title = item.url
				? `<a href="${escapeHtml(item.url)}" style="color:#0a0a0a;font-weight:700;text-decoration:underline;">${escapeHtml(
						item.short
					)}</a>`
				: `<strong>${escapeHtml(item.short)}</strong>`;
			return `<tr>
				<td style="padding:0 0 14px;">
					${title}
					<div style="margin-top:5px;font-size:14px;line-height:1.55;color:#686868;">${escapeHtml(
						item.support
					)}</div>
				</td>
			</tr>`;
		})
		.join('');
}

function section(title: string, body: string): string {
	return `<tr>
		<td style="padding:28px 0 0;">
			<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
				<tr>
					<td style="padding:0 0 12px;border-bottom:1px solid #e8dfd2;">
						<h2 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.2;color:#0a0a0a;">${escapeHtml(
							title
						)}</h2>
					</td>
				</tr>
				<tr>
					<td style="padding:16px 0 0;">${body}</td>
				</tr>
			</table>
		</td>
	</tr>`;
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
	<body style="margin:0;padding:0;background:#f6efe3;color:#0a0a0a;font-family:Arial,Helvetica,sans-serif;">
		<div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preheader)}</div>
		<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#f6efe3;">
			<tr>
				<td align="center" style="padding:34px 18px 42px;">
					<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;border-collapse:collapse;">
						<tr>
							<td style="padding:0 4px 14px;">
								<p style="margin:0;text-transform:uppercase;letter-spacing:.16em;font-size:12px;font-weight:800;color:#9a6412;">Pixel Poetry</p>
							</td>
						</tr>
						<tr>
							<td style="overflow:hidden;border:1px solid #e4d9ca;border-radius:18px;background:#fffaf1;">
								<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
									<tr>
										<td style="padding:34px 34px 28px;border-bottom:1px solid #e8dfd2;background:#fff7ea;">
											<p style="margin:0 0 12px;font-size:13px;font-weight:700;line-height:1.5;color:#6d6d6d;">Your private AI recap of ${input.insightCount} saved takeaway${
												input.insightCount === 1 ? '' : 's'
											}</p>
											<h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:38px;line-height:1.08;color:#0a0a0a;">${escapeHtml(
												title
											)}</h1>
											<table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:24px;border-collapse:collapse;">
												<tr>
													<td style="border-radius:999px;background:#0a0a0a;">
														<a href="${escapeHtml(
															input.siteUrl
														)}" style="display:inline-block;padding:12px 18px;border-radius:999px;color:#fffaf1;font-size:14px;font-weight:800;text-decoration:none;">Open Pixel Poetry</a>
													</td>
												</tr>
											</table>
										</td>
									</tr>
									<tr>
										<td style="padding:30px 34px 34px;">
											<p style="margin:0 0 16px;font-size:17px;line-height:1.65;color:#2f2f2f;">Hi ${escapeHtml(
												input.name
											)},</p>
											<p style="margin:0;font-size:18px;line-height:1.7;color:#2f2f2f;">${escapeHtml(
												input.summary.overview
											)}</p>

											<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
												${section(
													'Key takeaways',
													`<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">${list(
														input.summary.keyTakeaways
													)}</table>`
												)}
												${section(
													'Memory hooks',
													`<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">${list(
														input.summary.memoryHooks
													)}</table>`
												)}
												${section(
													'Shareable summary',
													`<div style="border-left:4px solid #f2a900;padding:4px 0 4px 16px;">
														<p style="margin:0;font-size:16px;line-height:1.7;color:#333;">${escapeHtml(
															input.summary.shareableSummary
														)}</p>
													</div>`
												)}
												${
													input.summary.sources?.length
														? section(
																'Sources behind this recap',
																`<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-size:15px;line-height:1.55;color:#333;">${sourceList(
																	input.summary.sources
																)}</table>`
															)
														: ''
												}
												${
													input.sourceLinks?.length
														? section(
																'Selected takeaways used',
																`<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-size:15px;line-height:1.55;color:#333;">${linkList(
																	input.sourceLinks
																)}</table>`
															)
														: ''
												}
												${
													input.summary.suggestedNextRead
														? `<tr>
																<td style="padding:26px 0 0;">
																	<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border-radius:14px;background:#f6efe3;">
																		<tr>
																			<td style="padding:18px 20px;font-size:15px;line-height:1.6;color:#444;">
																				<strong style="color:#0a0a0a;">Next:</strong> ${escapeHtml(input.summary.suggestedNextRead)}
																			</td>
																		</tr>
																	</table>
																</td>
															</tr>`
														: ''
												}
											</table>
										</td>
									</tr>
								</table>
							</td>
						</tr>
						<tr>
							<td style="padding:18px 4px 0;">
								<p style="margin:0;font-size:13px;line-height:1.6;color:#777;">This private email was sent to you because you requested a recap from your Pixel Poetry account.</p>
							</td>
						</tr>
					</table>
				</td>
			</tr>
		</table>
	</body>
</html>`;

	const text = [
		`Pixel Poetry: ${title}`,
		input.siteUrl,
		`Hi ${input.name},`,
		input.summary.overview,
		'Key takeaways:',
		...input.summary.keyTakeaways.map((item) => `- ${item}`),
		'Memory hooks:',
		...input.summary.memoryHooks.map((item) => `- ${item}`),
		'Shareable summary:',
		input.summary.shareableSummary,
		input.summary.sources?.length
			? [
					'Sources behind this recap:',
					...input.summary.sources.map(
						(item) => `- ${item.short}${item.url ? ` (${item.url})` : ''}: ${item.support}`
					)
				].join('\n')
			: '',
		input.sourceLinks?.length
			? [
					'Selected takeaways used:',
					...input.sourceLinks.map((item) =>
						[`- ${item.label}: ${item.href}`, item.image ? `  Image: ${item.image.src}` : '']
							.filter(Boolean)
							.join('\n')
					)
				].join('\n')
			: '',
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
