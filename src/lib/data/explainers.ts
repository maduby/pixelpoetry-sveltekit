/**
 * Site-wide index of explainer essays — drives the landing page grid and
 * the `/explainers` listing route. Each entry is a lightweight summary;
 * the heavy per-essay data (chapters, sources, terms, image manifest)
 * lives in `src/lib/explainers/<slug>/`.
 *
 * To add a new explainer:
 *   1. Run the `scaffold-explainer` skill (or follow its checklist by hand).
 *   2. Append an entry below.
 *   3. Wire the topic hub at `src/routes/<slug>/+page.svelte`.
 *   4. Wire the canonical essay at `src/routes/<slug>/explainer/+page.svelte`.
 */

export type ExplainerStatus = 'published' | 'in-progress' | 'planned';

export interface ExplainerSummary {
	slug: string;
	/** Canonical URL of the scrollytelling essay, e.g. /ultra-processed/explainer */
	href: string;
	/** Root topic URL, e.g. /ultra-processed — the hub for all content under this topic */
	topicHref: string;
	status: ExplainerStatus;
	eyebrow: string;
	title: string;
	tagline: string;
	/** Short marketing description for cards & meta tags. */
	description: string;
	/** Image name resolvable inside the explainer's own image-manifest, OR a
	 *  raw absolute URL. Cards prefer the manifest entry when available. */
	cover?: { name: string; alt: string };
	/** Responsive cover image for the card. When present, the card renders a
	 *  full srcset + blurhash placeholder instead of a plain <img>. */
	coverSrcset?: {
		src: string;
		srcset: string;
		sizes?: string;
		blurhash: string;
		width: number;
		height: number;
		alt: string;
	};
	/** Fallback flat image path if no manifest cover is available. */
	coverFallback?: string;
	readTimeMin?: number;
	chapterCount?: number;
	publishedAt?: string;
	accent: 'red' | 'amber' | 'pink' | 'ink' | 'forest' | 'blue';
}

export const explainers: ExplainerSummary[] = [
	{
		slug: 'ultra-processed',
		href: '/ultra-processed/explainer',
		topicHref: '/ultra-processed',
		status: 'published',
		eyebrow: 'Food & health',
		title: 'Ultra-Processed',
		tagline: "The food that isn't food — and what it's doing to us.",
		description:
			'Ultra-processed food now makes up more than half the British diet. An evidence-led interactive essay exploring the science — from addiction and obesity to deforestation and inequality.',
		coverSrcset: {
			src: '/explainers/ultra-processed/processed/upf-pile-900w.webp',
			srcset: [
				'/explainers/ultra-processed/processed/upf-pile-600w.webp 600w',
				'/explainers/ultra-processed/processed/upf-pile-900w.webp 900w',
				'/explainers/ultra-processed/processed/upf-pile-1200w.webp 1200w'
			].join(', '),
			sizes: '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
			blurhash: 'C3G8ZSuj4=yB~C0JN9-E',
			width: 1024,
			height: 629,
			alt: 'A chaotic pile of ultra-processed food packages, cans, and snacks'
		},
		coverFallback: '/explainers/ultra-processed/images/share-image--upf.png',
		readTimeMin: 12,
		chapterCount: 9,
		publishedAt: '2025-05-16',
		accent: 'red'
	},
	{
		slug: 'longevity',
		href: '/longevity/explainer',
		topicHref: '/longevity',
		status: 'published',
		eyebrow: 'Health & ageing',
		title: 'Longevity',
		tagline: 'What actually moves the needle on a longer, healthier life.',
		description:
			'What does the science actually say about living longer? A chapter-by-chapter investigation into longevity research — separating signal from noise on diet, exercise, sleep, and the biology of ageing.',
		coverSrcset: {
			src: '/explainers/longevity/processed/okinawa-800w.webp',
			srcset: [
				'/explainers/longevity/processed/okinawa-400w.webp 400w',
				'/explainers/longevity/processed/okinawa-800w.webp 800w',
				'/explainers/longevity/processed/okinawa-1200w.webp 1200w'
			].join(', '),
			sizes: '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
			blurhash: 'CNFXq}xwpItl~AtP%1xu',
			width: 2000,
			height: 1300,
			alt: 'Three older Japanese women sharing a meal in Okinawa'
		},
		readTimeMin: 14,
		chapterCount: 10,
		publishedAt: '2026-05-21',
		accent: 'forest'
	}
];

export function getExplainer(slug: string): ExplainerSummary | undefined {
	return explainers.find((e) => e.slug === slug);
}
