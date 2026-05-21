/**
 * Essay-specific brand & SEO metadata for the Ultra-Processed explainer.
 * Overrides the site-wide defaults in `$lib/data/site` when this explainer
 * is the active route.
 */
export const meta = {
	slug: 'ultra-processed',
	href: '/ultra-processed/explainer',
	topicHref: '/ultra-processed',
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
		'ultra-processed food, UPF, NOVA classification, food addiction, obesity, processed food health risks, Chris van Tulleken, food system, junk food, diet and cancer, food inequality',
	editorial: {
		title: 'Why I made this',
		body: `
<p>Write your motivation, backstory, and caveats here. This is your editorial note to the reader — the part of the essay that sits behind the byline.</p>

<p>You can use full rich text: <strong>bold</strong>, <em>italic</em>, <a href="#">links</a>, blockquotes, images, and lists. Replace this placeholder with your own words.</p>

<blockquote><p>What triggered this piece, what you were trying to understand, what surprised you along the way, and what you are still uncertain about.</p></blockquote>

<h2>Caveats</h2>
<p>What you would add, qualify, or change after writing it. Where the evidence is genuinely contested. What you left out and why.</p>

<h2>Sources</h2>
<p>The primary sources are listed at the bottom of the essay. A few that shaped the thinking most:</p>
<ul class="sources-list">
  <li>Chris van Tulleken — <em>Ultra-Processed People</em> (2023)</li>
  <li>Carlos Monteiro et al. — <a href="https://www.thelancet.com" target="_blank" rel="noopener">NOVA classification, Public Health Nutrition</a></li>
</ul>
`
	}
} as const;

export type ExplainerMeta = typeof meta;
