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
	ogImage: '/explainers/longevity/images/share-image--longevity.png',
	accent: 'forest' as const,
	readTimeMin: 14,
	chapterCount: 10,
	publishedAt: '2026-05-21',
	keywords:
		'longevity, lifespan, healthspan, ageing, hallmarks of aging, blue zones, caloric restriction, exercise longevity, sleep health, evidence-based longevity',
	keyTakeaways: [
		{
			text: 'In 2025, you study the exposome — the full weight of everything your body has ever been exposed to.',
			href: '#three-eras-of-medicine',
			linkLabel: 'Read the evidence'
		},
		{
			text: 'Sleep, Mindset, Exercise, Diet, and Stress. Not a lifestyle blog. A framework built from the evidence up.',
			href: '#smeds-framework',
			linkLabel: 'Read the framework'
		},
		{
			text: 'The OLP report frames its evidence at the level of the individual. The same evidence supports a very different reading.',
			href: '#what-critics-get-right',
			linkLabel: 'Read the critique'
		},
		{
			text: 'Here is what the evidence actually supports — ordered by strength of evidence.',
			href: '#what-do-you-do-on-monday',
			linkLabel: 'Read what works'
		},
		{
			text: 'The things with the strongest evidence are free, or nearly so.',
			href: '#what-do-you-do-on-monday',
			linkLabel: 'Go to Monday'
		}
	],
	editorial: {
		title: 'Why I made this',
		lastUpdated: '22 May 2026 at 7:51am SAST',
		body: `
<p>My name is <a href="https://duby.io" target="_blank" rel="noopener">Marc Duby</a>, and I try to boil down stories, articles, and topics that I find interesting and worth reading. I know it is hard to find enough time to read articles, books, or even, imagine, scientific papers. That is why I am trying to explain complex topics with these hopefully easy-to-use and interesting little interactive essays.</p>

<h2>The starting point</h2>
<p>The starting point for this piece was the Oxford Longevity Project report <em>Living Longer, Better: The Age-less Report</em>. I found it fascinating how longevity has become such a huge thing: part science, part industry, part culture war, part personal hope. I wanted to take some of the claims in the report and bring them to life in a way that felt readable, visual, and a little less breathless.</p>

<ul class="sources-list">
  <li><a href="/explainers/longevity/sources/living-longer-better-olp-report.pdf" target="_blank" rel="noopener">Read the report PDF</a></li>
  <li><a href="https://oxfordlongevityproject.org/" target="_blank" rel="noopener">Oxford Longevity Project website</a></li>
  <li><a href="https://oxfordlongevityproject.org/live-longer-better" target="_blank" rel="noopener">Live Longer Better plan</a></li>
</ul>

<h2>What I was trying to do</h2>
<p>I wanted to separate the signal from the noise. Longevity is full of supplements, protocols, miracle routines, and extremely confident men on podcasts. But underneath all that, there are some surprisingly ordinary, evidence-backed ideas: sleep, movement, food, stress, social connection, mindset, and the environments that make healthy choices easier or harder.</p>

<h2>Caveats</h2>
<p>I am not claiming that everything in these pieces is always 100% accurate. The stories I choose to tell often start from a paper, article, report, or book, and I mention that starting point here. From there, I try to cross-check, simplify, and visualise. Simplifying always loses some detail, and science keeps moving.</p>

<p>This piece is also not medical advice. It is an editorial explainer: a way into the topic, not the final word on it.</p>

<h2>Feedback</h2>
<p>Any feedback is always welcome: future topics to cover, criticism, corrections, anything. Reach out at <a href="mailto:mail@pixelpoetry.dev">mail@pixelpoetry.dev</a>.</p>

<p>Happy reading.</p>
`
	}
} as const;

export type LongevityMeta = typeof meta;
