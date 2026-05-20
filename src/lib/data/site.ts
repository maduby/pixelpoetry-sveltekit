/**
 * Site-wide brand & SEO defaults for pixelpoetry.dev.
 *
 * Per-explainer metadata (title, description, og image, accent, etc.)
 * lives in `src/lib/explainers/<slug>/meta.ts` and overrides these defaults
 * on explainer routes.
 */
export const site = {
	name: 'Pixel Poetry',
	shortName: 'PP',
	tagline: 'Slow journalism. One scroll at a time.',
	/**
	 * Primary meta description (<=160 chars). Appears in Google snippets,
	 * social previews, and screen-reader page summaries.
	 */
	description:
		'Pixel Poetry is a series of carefully researched scrollytelling essays — one topic at a time, built to hold up under scrutiny.',
	/**
	 * Extended description for structured data and Open Graph fallback.
	 */
	longDescription:
		'One subject. Months of reading. Every chart earns its place, every claim cites a source. Pixel Poetry is what happens when a data journalist and web engineer gets genuinely alarmed about something and refuses to publish until it\'s right.',
	url: 'https://pixelpoetry.dev',
	/** Default OG image. Until a dedicated pixelpoetry.dev hero is shipped we
	 *  reuse the ultra-processed share image so socials don't 404. */
	ogImage: '/explainers/ultra-processed/share-image.jpg',
	locale: 'en-GB',
	twitter: '@marcduby',
	author: 'Marc Duby & Pixel Poetry',
	keywords:
		'scrollytelling, data journalism, immersive essay, ultra-processed food, longevity, health, evidence-led, sveltekit, pixel poetry'
} as const;

export type Site = typeof site;
