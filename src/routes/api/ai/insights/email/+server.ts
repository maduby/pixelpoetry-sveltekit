import { json, error } from '@sveltejs/kit';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { imageManifest as longevityImages } from '$lib/explainers/longevity/image-manifest';
import { imageManifest as ultraProcessedImages } from '$lib/explainers/ultra-processed/image-manifest';
import { site } from '$lib/data/site';
import { db, schema } from '$lib/server/db';
import { getWeeklyUsageForUser, WEEKLY_EMAIL_LIMIT } from '$lib/server/ai/weekly-limits';
import { getResendClient, getResendFromEmail } from '$lib/server/email/resend';
import { renderInsightSummaryEmail } from '$lib/server/email/insight-summary-email';
import type { ImageEntry } from '$lib/types/explainer';
import type { RequestHandler } from './$types';

const emailRequestSchema = z.object({
	summaryId: z.string().min(1).optional()
});

const IMAGE_MANIFESTS: Record<string, ImageEntry[]> = {
	longevity: longevityImages,
	'ultra-processed': ultraProcessedImages
};

type SavedInsightRow = typeof schema.savedInsight.$inferSelect;

export const POST: RequestHandler = async ({ locals, request, url }) => {
	if (!locals.user) error(401, 'Log in to email saved-insight summaries.');

	const weeklyUsage = await getWeeklyUsageForUser(locals.user.id);
	if (weeklyUsage.emailsUsed >= WEEKLY_EMAIL_LIMIT) {
		error(429, 'You have used all 5 recap emails for this week.');
	}

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
	const sourceInsights = summary.insightIds.length
		? await db
				.select()
				.from(schema.savedInsight)
				.where(
					and(
						eq(schema.savedInsight.userId, locals.user.id),
						inArray(schema.savedInsight.id, summary.insightIds)
					)
				)
		: [];
	const sourceInsightById = new Map(sourceInsights.map((insight) => [insight.id, insight]));
	const emailOrigin = emailAssetOrigin(url.origin);

	const email = renderInsightSummaryEmail({
		name: locals.user.name,
		explainerSlug: summary.explainerSlug,
		insightCount: summary.insightCount,
		summary: summary.summaryJson,
		siteUrl: emailOrigin,
		sourceLinks: summary.insightIds
			.map((id) => sourceInsightById.get(id))
			.filter((insight) => insight != null)
			.map((insight) => sourceLinkFromInsight(insight, emailOrigin))
			.filter((item, index, items) => {
				const duplicateIndex = items.findIndex(
					(other) => other.label === item.label && other.excerpt === item.excerpt
				);
				return duplicateIndex === index;
			})
			.slice(0, 5)
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

function emailAssetOrigin(requestOrigin: string): string {
	if (/^https:\/\/(www\.)?pixelpoetry\.dev$/i.test(requestOrigin)) return requestOrigin;
	return site.url;
}

function labelFromSlug(value: string): string {
	return value
		.split('-')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

function sourceLinkFromInsight(insight: SavedInsightRow, origin: string) {
	const image = imageFromInsight(insight, origin);
	const kind = contentKindLabel(insight.contentKind);
	const imageLabel = insight.contentKind === 'image' ? imageTakeawayLabel(insight) : null;

	return {
		label: [
			imageLabel ? `${kind}: ${imageLabel}` : kind,
			labelFromSlug(insight.explainerSlug),
			labelFromSlug(insight.chapterId)
		].join(' / '),
		href: `${origin}/${insight.explainerSlug}/explainer#${insight.chapterId}--${insight.stepId}`,
		excerpt: excerptFromInsight(insight),
		image
	};
}

function contentKindLabel(kind: string | null | undefined): string {
	if (!kind || kind === 'text') return 'Text';
	if (kind === 'dataset') return 'Data';
	return kind.charAt(0).toUpperCase() + kind.slice(1);
}

function imageTakeawayLabel(insight: SavedInsightRow): string | null {
	return (
		textValue(insight.contentJson?.label) ||
		textValue(insight.contentJson?.caption) ||
		textValue(insight.contentJson?.alt) ||
		textValue(insight.contentJson?.imageName)?.replace(/[-_]+/g, ' ') ||
		null
	);
}

function excerptFromInsight(insight: SavedInsightRow): string {
	const preferred =
		textValue(insight.contentJson?.description) ||
		textValue(insight.contentJson?.caption) ||
		textValue(insight.contentJson?.label) ||
		insight.selectedText;
	return truncate(cleanExcerpt(preferred), 260);
}

function cleanExcerpt(value: string): string {
	return value
		.replace(/\s+/g, ' ')
		.replace(/\s+—\s+%$/, '')
		.trim();
}

function truncate(value: string, maxLength: number): string {
	if (value.length <= maxLength) return value;
	const sliced = value.slice(0, maxLength - 1);
	const lastSpace = sliced.lastIndexOf(' ');
	return `${sliced.slice(0, lastSpace > maxLength * 0.6 ? lastSpace : sliced.length).trim()}…`;
}

function imageFromInsight(insight: SavedInsightRow, origin: string) {
	if (insight.contentKind !== 'image') return undefined;

	const imageName = insight.contentJson?.imageName;
	if (!imageName) return undefined;

	const entry = IMAGE_MANIFESTS[insight.explainerSlug]?.find((image) => image.name === imageName);
	const variant =
		entry?.variants.find((candidate) => candidate.width >= 800) ?? entry?.variants.at(-1);
	if (!entry || !variant) return undefined;

	const caption = textValue(insight.contentJson?.caption);
	const credit = textValue(insight.contentJson?.credit ?? entry.credit);
	const alt =
		textValue(insight.contentJson?.alt) ||
		caption ||
		textValue(insight.contentJson?.label) ||
		'Saved Pixel Poetry image';

	return {
		src: new URL(variant.src, origin).toString(),
		alt,
		caption,
		credit,
		width: variant.width,
		height: Math.round((entry.height / entry.width) * variant.width)
	};
}

function textValue(value: unknown): string | undefined {
	return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}
