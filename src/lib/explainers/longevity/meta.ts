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
		'longevity, lifespan, healthspan, ageing, hallmarks of aging, blue zones, caloric restriction, exercise longevity, sleep health, evidence-based longevity',
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
  <li>Oxford Longevity Project — <a href="https://www.ox.ac.uk/longevity" target="_blank" rel="noopener">ox.ac.uk/longevity</a></li>
</ul>
`
	}
} as const;

export type LongevityMeta = typeof meta;
