/**
 * Essay-specific brand & SEO metadata for the Ultra-Processed explainer.
 * Overrides the site-wide defaults in `$lib/data/site` when this explainer
 * is the active route.
 */
export const meta = {
	slug: 'ultra-processed',
	href: '/explainers/ultra-processed',
	name: 'Ultra-Processed',
	shortName: 'UPF',
	emoji: '🍞',
	eyebrow: 'Food & health',
	tagline: "The food that isn't food — and what it's doing to us.",
	/** Primary meta description (<=160 chars). */
	description:
		'Ultra-processed food now makes up more than half the British diet. An evidence-led interactive essay exploring the science — from addiction and obesity to deforestation and inequality.',
	longDescription:
		'An immersive, chapter-by-chapter investigation into ultra-processed food (UPF): what the NOVA classification reveals, how UPF rewires appetite and drives addiction, its links to cancer, obesity, and cardiovascular disease, and the systemic inequalities that make it hardest to avoid for those who can least afford the health consequences.',
	ogImage: '/explainers/ultra-processed/share-image.jpg',
	accent: 'red' as const,
	readTimeMin: 12,
	chapterCount: 9,
	publishedAt: '2025-05-16',
	keywords:
		'ultra-processed food, UPF, NOVA classification, food addiction, obesity, processed food health risks, Chris van Tulleken, food system, junk food, diet and cancer, food inequality'
} as const;

export type ExplainerMeta = typeof meta;
