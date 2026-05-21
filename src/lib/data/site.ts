/**
 * Site-wide brand & SEO defaults for pixelpoetry.dev.
 *
 * Per-explainer metadata (title, description, og image, accent, etc.)
 * lives in `src/lib/explainers/<slug>/meta.ts` and overrides these defaults
 * on explainer routes.
 */
export const site = {
	name: 'PixelPoetry',
	shortName: 'PP',
	tagline: 'Slow journalism. One scroll at a time.',
	/**
	 * Primary meta description (<=160 chars). Appears in Google snippets,
	 * social previews, and screen-reader page summaries.
	 */
	description:
		'Pixel Poetry is a small collection of visual essays by Marc Duby — a place for topics I keep thinking about and want to understand a bit better.',
	/**
	 * Extended description for structured data and Open Graph fallback.
	 */
	longDescription:
		'Pixel Poetry is a new little corner of the Internet where I turn topics I find interesting, worrying, or strangely sticky into interactive essays. A bit of reporting, a bit of data visualisation, a bit of trying to make sense of things without pretending to have the final word.',
	url: 'https://www.pixelpoetry.dev',
	/** Default OG image for the homepage, about page, explainers index, and fallbacks. */
	ogImage: '/share-image--pixelpoetry.png',
	locale: 'en-GB',
	twitter: '@marcduby',
	author: 'Marc Duby & Pixel Poetry',
	keywords:
		'scrollytelling, data journalism, immersive essay, ultra-processed food, longevity, health, evidence-led, sveltekit, pixel poetry'
} as const;

export type Site = typeof site;
