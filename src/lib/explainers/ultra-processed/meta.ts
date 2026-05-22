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
	ogImage: '/explainers/ultra-processed/images/share-image--upf.png',
	accent: 'red' as const,
	readTimeMin: 12,
	chapterCount: 9,
	publishedAt: '2025-05-16',
	keywords:
		'ultra-processed food, UPF, NOVA classification, food addiction, obesity, processed food health risks, Chris van Tulleken, food system, junk food, diet and cancer, food inequality',
	keyTakeaways: [
		{
			text: 'Walk into any supermarket. Pick up almost anything. Read the back of the packet.',
			href: '#the-new-normal',
			linkLabel: 'Read the shift'
		},
		{
			text: 'Food becomes ultra-processed when its ingredients leave the kitchen entirely.',
			href: '#what-is-it',
			linkLabel: 'Read NOVA'
		},
		{
			text: 'The largest pooled study ever conducted on UPF found adverse health effects across nearly every organ system.',
			href: '#body-under-siege',
			linkLabel: 'Read the risks'
		},
		{
			text: 'Soft. Calorie-dense. Fast to chew. Slow to satiate.',
			href: '#engineered-to-addict',
			linkLabel: 'Read the design'
		},
		{
			text: 'There is no clean exit from a food system this large. There are, however, levers.',
			href: '#what-now',
			linkLabel: 'Read what now'
		}
	],
	editorial: {
		title: 'Why I made this',
		lastUpdated: '22 May 2026 at 7:51am SAST',
		body: `
<p>My name is <a href="https://duby.io" target="_blank" rel="noopener">Marc Duby</a>, and I try to boil down stories, articles, and topics that I find interesting and worth reading. I know it is hard to find enough time to read articles, books, or even, imagine, scientific papers. That is why I am trying to explain complex topics with these hopefully easy-to-use and interesting little interactive essays.</p>

<h2>The starting point</h2>
<p>The starting point for this piece was Dr Chris van Tulleken's book <em>Ultra-Processed People</em>, alongside the NOVA research that gave the topic its language: Monteiro and colleagues' paper on the food classification and the trouble with ultra-processing.</p>

<ul class="sources-list">
  <li><a href="https://www.penguin.co.uk/books/451300/ultra-processed-people-by-tulleken-chris-van/9781529160222" target="_blank" rel="noopener"><em>Ultra-Processed People</em> by Dr Chris van Tulleken</a></li>
  <li><a href="/explainers/ultra-processed/sources/monteiro-2017-nova.pdf" target="_blank" rel="noopener">Read the Monteiro NOVA paper PDF</a></li>
  <li><a href="https://www.cambridge.org/core/journals/public-health-nutrition/article/un-decade-of-nutrition-the-nova-food-classification-and-the-trouble-with-ultraprocessing/2A9776922A28F8F757BDA32C3266AC2A" target="_blank" rel="noopener">Monteiro et al. on Cambridge Core</a></li>
  <li><a href="https://www.bmj.com/content/384/bmj-2023-077310" target="_blank" rel="noopener">BMJ umbrella review on UPF and health outcomes</a></li>
</ul>

<h2>What I was trying to do</h2>
<p>I wanted to make the UPF story feel concrete. Not just "junk food is bad", which is easy to say and not very useful, but how the modern food system designs products, markets them, normalises them, and then makes avoiding them feel like a personal test of discipline.</p>

<p>What interested me most was that ultra-processing is not only a nutrition story. It is also a story about convenience, class, addiction, packaging, profit, regulation, and the strange fact that some food is now engineered less like cooking and more like software.</p>

<h2>Caveats</h2>
<p>I am not claiming that everything in these pieces is always 100% accurate. The stories I choose to tell often start from a paper, article, report, or book, and I mention that starting point here. From there, I try to cross-check, simplify, and visualise. Simplifying always loses some detail, and science keeps moving.</p>

<p>UPF is also a contested topic. The NOVA framework is useful, but it is not perfect. Some ultra-processed products are worse than others. Some foods that sound "processed" are perfectly sensible. The point of this essay is not purity. It is pattern recognition.</p>

<h2>Feedback</h2>
<p>Any feedback is always welcome: future topics to cover, criticism, corrections, anything. Reach out at <a href="mailto:mail@pixelpoetry.dev">mail@pixelpoetry.dev</a>.</p>

<p>Happy reading.</p>
`
	}
} as const;

export type ExplainerMeta = typeof meta;
