/**
 * Essay-specific brand & SEO metadata for the Longevity explainer.
 * Overrides the site-wide defaults in `$lib/data/site` when this explainer
 * is the active route.
 *
 * Colour scheme: forest green + teal — life, growth, the long arc.
 */
export const meta = {
	slug: 'longevity',
	href: '/longevity/explainer',
	topicHref: '/longevity',
	name: 'Longevity',
	shortName: 'LNG',
	emoji: '🌿',
	eyebrow: 'Health & ageing',
	tagline: 'What actually moves the needle on a longer, healthier life.',
	/** Primary meta description (<=160 chars). */
	description:
		'An evidence-led interactive essay on longevity science — separating the signal from the noise on diet, exercise, sleep, and the biology of ageing.',
	longDescription:
		'What does the science actually say about living longer, healthier? A chapter-by-chapter investigation into longevity research: the hallmarks of ageing, what lifestyle interventions have real evidence behind them, and why most of what gets sold as "longevity" is noise.',
	ogImage: '/longevity/share-image.jpg',
	accent: 'forest' as const,
	readTimeMin: 14,
	chapterCount: 10,
	publishedAt: undefined,
	keywords:
		'longevity, lifespan, healthspan, ageing, hallmarks of aging, blue zones, caloric restriction, exercise longevity, sleep health, evidence-based longevity'
} as const;

export type LongevityMeta = typeof meta;
