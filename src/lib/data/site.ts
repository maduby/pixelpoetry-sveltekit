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
	tagline: 'Evidence-led scrollytelling on the things that shape us.',
	/**
	 * Primary meta description (<=160 chars). Appears in Google snippets,
	 * social previews, and screen-reader page summaries.
	 */
	description:
		'Pixel Poetry is a growing series of immersive, evidence-led web essays exploring food, health, longevity, and the systems that shape modern life.',
	/**
	 * Extended description for structured data and Open Graph fallback.
	 */
	longDescription:
		'Pixel Poetry publishes immersive, evidence-led scrollytelling essays on topics that quietly shape our lives — diet, health, longevity, the food system, attention, and inequality. Each piece is a chapter-by-chapter investigation backed by peer-reviewed sources, custom data visualisations, and original animations.',
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
