/**
 * Site-wide index of explainer essays — drives the landing page grid and
 * the `/explainers` listing route. Each entry is a lightweight summary;
 * the heavy per-essay data (chapters, sources, terms, image manifest)
 * lives in `src/lib/explainers/<slug>/`.
 *
 * To add a new explainer:
 *   1. Run the `scaffold-explainer` skill (or follow its checklist by hand).
 *   2. Append an entry below.
 *   3. Wire the route at `src/routes/explainers/<slug>/+page.svelte`.
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
	/** Fallback flat image path if no manifest cover is available. */
	coverFallback?: string;
	readTimeMin?: number;
	chapterCount?: number;
	publishedAt?: string;
	accent: 'red' | 'amber' | 'pink' | 'ink';
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
		cover: { name: 'upf-supermarket', alt: 'Aisle of brightly packaged ultra-processed food' },
		coverFallback: '/explainers/ultra-processed/share-image.jpg',
		readTimeMin: 12,
		chapterCount: 9,
		publishedAt: '2025-05-16',
		accent: 'red'
	},
	{
		slug: 'longevity',
		href: '/longevity/explainer',
		topicHref: '/longevity',
		status: 'planned',
		eyebrow: 'Health & ageing',
		title: 'Longevity',
		tagline: 'What actually moves the needle on a longer, healthier life.',
		description:
			'A working draft. Sources are being gathered in /docs/explainers/longevity/sources/. The scrollytelling essay is next up.',
		accent: 'amber'
	}
];

export function getExplainer(slug: string): ExplainerSummary | undefined {
	return explainers.find((e) => e.slug === slug);
}
