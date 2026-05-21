/**
 * Hardcoded chapter data for the Ultra-Processed scrollytelling essay.
 *
 * Edit freely. Every numeric `stat.value` should cite a source via `sourceId`
 * resolvable against `./sources.ts`.
 *
 * Steps with `stat` get a big number reveal; steps with `quote` render a
 * blockquote callout; plain steps are narrative beats.
 *
 * All scrollytelling types live in `$lib/types/explainer.ts` so they can be
 * reused across essays.
 */

import type {
	BarDataPoint,
	BubbleDataPoint,
	Chapter,
	DonutDataPoint,
	LineSeries
} from '$lib/types/explainer';

export function getChapter(id: string): Chapter | undefined {
	return chapters.find((c) => c.id === id);
}

export const chapters: Chapter[] = [
	{
		id: 'the-new-normal',
		number: 1,
		eyebrow: 'Chapter 1',
		emoji: '🍔',
		title: 'The New Normal',
		intro:
			'For the first time in human history, most of what we eat is not really food. It is an industrial substance, invented in the last forty years, that just happens to be edible.',
		accent: 'red',
		steps: [
			{
				id: 'opening',
				text: 'Walk into any supermarket. Pick up almost anything. Read the back of the packet. Most of what is printed there cannot be found in any kitchen, in any country, at any point in human history before about 1980.',
				richText:
					'Walk into any supermarket. Pick up almost anything. Read the back of the packet. <strong>Most of what is printed there cannot be found in any kitchen</strong>, in any country, at any point in human history <strong>before about 1980.</strong>',
				viz: {
					type: 'image',
					name: 'upf-supermarket',
					alt: 'Aisles of ultra-processed packaged food in a supermarket.',
					caption: 'Ultra-processed food fills the modern supermarket aisle.',
					sourceId: 'body-coach-upf-guide',
					credit: 'Via The Body Coach (thebodycoach.com) — editorial illustration, all rights reserved'
				}
			},
			{
				id: 'share-of-calories',
				text: 'In the UK and the US, roughly 60% of every adult’s daily calories now come from foods that are formulated, not cooked.',
				richText:
					'In the UK and the US, <strong>roughly 60%</strong> of every adult’s daily calories now come from foods that are <strong>formulated, not cooked.</strong>',
				viz: {
					type: 'image',
					name: 'upf-factory',
					alt: 'Cookies being mass-produced on an industrial factory line.',
					caption: 'Most of the food in the modern UK and US diet is now made on production lines like this one.',
					sourceId: 'bhf-upf-health',
					credit: 'Via British Heart Foundation (bhf.org.uk) — editorial illustration, all rights reserved'
				}
			},
			{
				id: 'children',
				text: 'For children — whose taste preferences are still forming — the share is higher still.',
				richText:
					'For <strong>children</strong> — whose taste preferences are still forming — <strong>the share is higher still.</strong>',
				viz: {
					type: 'image',
					name: 'upf-kellogs',
					alt: 'Kellogg\'s Coco Pops Chocolate Flavour Multigrain Cereals box.',
					caption: 'Sugary breakfast cereals like Kellogg\'s Coco Pops are marketed directly to children — and roughly 65% of the average UK child\'s diet is now ultra-processed (BMJ, 2024).',
					sourceId: 'kelloggs-coco-pops-sa',
					credit: '© Kellogg\'s South Africa — official product image, kelloggs.com (2400×2400), reproduced for editorial commentary',
					fit: 'contain',
					aspect: 'square'
				}
			},
			{
				id: 'historic',
				text: 'This is not a continuation of the long human story of bread, cheese, salt and beer. This is something new — a category of substance that didn’t exist when most adults alive today were born.',
				richText:
					'This is not a continuation of the long human story of bread, cheese, salt and beer. This is something new — <strong>a category of substance that didn’t exist</strong> when most adults alive today were born.',
				viz: {
					type: 'obs-timeline',
					title: 'A category of food that barely existed a generation ago',
					subtitle:
						'Share of daily calories from ultra-processed food — Marino et al. (Nutrients, 2021), pooled from 99 studies across 21 countries, 2004–2021',
					unit: '%',
					domain: [2003, 2022],
					valueDomain: [0, 65],
					series: [
						{
							label: 'USA',
							color: '#be185d',
							points: [
								{ year: 2008, value: 58 },
								{ year: 2010, value: 59 },
								{ year: 2012, value: 60 },
								{ year: 2018, value: 57 }
							]
						},
						{
							label: 'UK',
							color: '#1e3a5f',
							points: [
								{ year: 2008, value: 53 },
								{ year: 2014, value: 57 },
								{ year: 2018, value: 54 }
							]
						},
						{
							label: 'Canada',
							color: '#b45309',
							points: [
								{ year: 2004, value: 48 },
								{ year: 2015, value: 46 }
							]
						},
						{
							label: 'Brazil',
							color: '#6d28d9',
							points: [
								{ year: 2008, value: 21 },
								{ year: 2014, value: 22 },
								{ year: 2018, value: 25 }
							]
						},
						{
							label: 'France',
							color: '#374151',
							points: [
								{ year: 2020, value: 17 }
							]
						},
						{
							label: 'Italy',
							color: '#15803d',
							points: [{ year: 2017, value: 10 }]
						}
					],
					sourceId: 'marino-2021-nutrients'
				},
				quote: {
					text: 'It’s not food. It’s an industrially produced edible substance.',
					attribution: 'Dr Chris van Tulleken',
					sourceId: 'van-tulleken-2023'
				}
			}
		],
		sources: ['van-tulleken-2023', 'bmj-2024', 'body-coach-upf-guide', 'bhf-upf-health', 'marino-2021-nutrients']
	},
	{
		id: 'what-is-it',
		number: 2,
		eyebrow: 'Chapter 2',
		emoji: '🥯',
		title: 'What Is It, Actually?',
		intro:
			'Researchers in Brazil drew the only line that holds up: food becomes ultra-processed when its ingredients leave the kitchen entirely.',
		accent: 'amber',
		steps: [
			{
				id: 'nova',
				text: 'The NOVA classification, developed at the University of São Paulo in 2009, sorts every food into one of four groups based on how — and why — it was processed.',
				richText:
					'The <a data-term="nova">NOVA classification</a>, developed at the University of São Paulo in 2009, sorts every food into <strong>one of four groups</strong> based on how — and why — it was processed.',
				viz: {
					type: 'obs-bar',
					title: 'What a UK adult eats — share by NOVA group',
					subtitle: 'Share of total calorie intake — dietary surveys cited in van Tulleken (2023)',
					unit: '%',
					data: [
						{ label: 'Group 4 — Ultra-processed', value: 57, color: '#be185d' },
						{ label: 'Group 3 — Processed foods', value: 24, color: '#b45309' },
						{ label: 'Group 1 — Unprocessed', value: 15, color: '#1e3a5f' },
						{ label: 'Group 2 — Culinary', value: 4, color: '#6d28d9' }
					],
					sourceId: 'van-tulleken-2023'
				}
			},
			{
				id: 'kitchen-test',
				text: 'Van Tulleken gives readers a simpler heuristic.',
				quote: {
					text: 'If an ingredient on a food packet isn’t one you would normally find in a home kitchen, it’s a UPF.',
					attribution: 'Dr Chris van Tulleken',
					sourceId: 'van-tulleken-2023'
				}
			},
			{
				id: 'examples',
				text: 'Hydrolysed proteins. Modified starches. Emulsifiers. Glazing agents. Anti-foaming agents. Flavour enhancers. None of these exist in nature; almost none of them existed in the food supply fifty years ago.',
				richText:
					'<strong>Hydrolysed proteins. Modified starches. Emulsifiers. Glazing agents.</strong> Anti-foaming agents. Flavour enhancers. <strong>None of these exist in nature</strong>; almost none of them existed in the food supply fifty years ago.',
				viz: {
					type: 'obs-bar',
					title: 'Where UPF calories come from',
					subtitle: 'Share of total calorie intake, UK average adult — van Tulleken (2023)',
					unit: '% of diet',
					data: [
						{ label: 'Factory-made bread', value: 11, color: '#be185d' },
						{ label: 'Pre-packaged meals', value: 8, color: '#be185d' },
						{ label: 'Breakfast cereals', value: 4, color: '#b45309' },
						{ label: 'Sausages / reconstituted meat', value: 4, color: '#b45309' },
						{ label: 'Confectionery', value: 4, color: '#b45309' },
						{ label: 'Biscuits', value: 4, color: '#b45309' },
						{ label: 'Pastries, buns, cakes', value: 3, color: '#6d28d9' },
						{ label: 'Chips / fries (factory)', value: 3, color: '#6d28d9' },
						{ label: 'Soft drinks', value: 3, color: '#6d28d9' },
						{ label: 'Salty snacks (crisps)', value: 2, color: '#1e3a5f' }
					],
					sourceId: 'van-tulleken-2023'
				}
			},
			{
				id: 'misconception',
				text: 'Ultra-processed is not a synonym for unhealthy. Many products marketed as healthy — protein bars, plant-based meats, diet yoghurts, even baby formula — meet the NOVA definition exactly.',
				richText:
					'<strong>Ultra-processed is not a synonym for unhealthy.</strong> Many products marketed as healthy — protein bars, plant-based meats, diet yoghurts, even baby formula — <strong>meet the NOVA definition exactly.</strong>',
				viz: {
					type: 'image',
					name: 'upf-healthy',
					alt: 'Modern Baker "Superloaf" — a sliced bread positioned by its makers as the "world\'s first healthy UPF".',
					caption: 'Modern Baker\'s Superloaf — listed in M&S, Sainsbury\'s, Ocado and Morrisons, and marketed as "the world\'s first healthy UPF". By NOVA standards it is still an ultra-processed food.',
					sourceId: 'superloaf-listings-2024',
					credit: '© Modern Baker / Hovis — Superloaf product image via Inside Food & Drink (insidefoodanddrink.com), reproduced for editorial commentary',
					fit: 'contain',
					aspect: '4/5',
					imgClass: 'translate-x-4 lg:translate-x-0'
				}
			}
		],
		sources: ['van-tulleken-2023', 'monteiro-2017', 'superloaf-listings-2024']
	},
	{
		id: 'one-month',
		number: 3,
		eyebrow: 'Chapter 3',
		emoji: '🍕',
		title: 'One Month. One Man. One Experiment.',
		shortTitle: 'The Experiment',
		intro:
			'To understand what UPF does, an infectious disease doctor agreed to eat it — and almost nothing else — for thirty days.',
		accent: 'pink',
		steps: [
			{
				id: 'setup',
				text: 'Dr Chris van Tulleken — physician, virologist, BBC broadcaster — designed a self-experiment. For a month he would eat a diet of 80% ultra-processed food, the level documented for many lower-income UK households.',
				richText:
					'Dr Chris van Tulleken — physician, virologist, BBC broadcaster — designed a self-experiment. For a month he would eat a diet of <strong>80% ultra-processed food</strong>, the level documented for many <strong>lower-income UK households.</strong>',
				viz: {
					type: 'donut',
				data: [
					{ label: 'Ultra-processed', value: 80, color: '#be185d' },
					{ label: 'Whole foods', value: 20, color: '#1e3a5f' }
				]
			}
		},
		{
			id: 'portrait',
				text: 'The face behind the experiment.',
				viz: {
					type: 'image',
					name: 'chris-van-tulleken',
					alt: 'Dr Chris van Tulleken',
					caption: 'Dr Chris van Tulleken — physician, virologist, and author of Ultra-Processed People (2023).',
					sourceId: 'van-tulleken-2023',
					credit: '© Cornerstone Press / Penguin Random House — author portrait'
				}
			},
			{
				id: 'weight',
				text: 'He gained weight, fast.',
				stat: {
					value: '6',
					unit: 'kg',
					label: 'weight gained in 30 days.',
					context:
						'The equivalent of more than half a stone, on a diet matched to his usual calorie target.',
					sourceId: 'van-tulleken-2023'
				}
			},
			{
				id: 'hormones',
				text: 'Blood tests showed his hunger hormones were misfiring. Leptin, the satiety signal, was suppressed. Ghrelin, the hunger signal, was elevated. His body was telling him to keep eating, even when he had already eaten more than he needed.',
				richText:
					'Blood tests showed his hunger hormones were misfiring. <strong>Leptin, the satiety signal, was suppressed. Ghrelin, the hunger signal, was elevated.</strong> His body was telling him to keep eating, even when he had already eaten more than he needed.',
				viz: {
					type: 'obs-bar',
					title: 'Hunger hormones after 30 days of UPF',
					subtitle: 'Indexed to pre-diet baseline = 100',
					unit: '',
					data: [
					{ label: 'Leptin (satiety signal)', group: 'Before UPF diet', value: 100, color: '#0a0a0a18' },
					{ label: 'Leptin (satiety signal)', group: 'After 30 days', value: 40, color: '#be185d' },
					{ label: 'Ghrelin (hunger signal)', group: 'Before UPF diet', value: 100, color: '#0a0a0a18' },
					{ label: 'Ghrelin (hunger signal)', group: 'After 30 days', value: 162, color: '#be185d' }
					],
					sourceId: 'van-tulleken-2023'
				}
			},
			{
				id: 'inflammation',
				text: 'His cholesterol climbed. Systemic inflammation markers rose. An MRI showed altered activity in the brain’s reward circuitry — the same pathways implicated in substance addiction.',
				richText:
					'His <strong>cholesterol climbed</strong>. Systemic <strong>inflammation markers rose</strong>. An MRI showed altered activity in the brain’s <strong>reward circuitry</strong> — the same pathways implicated in <strong>substance addiction.</strong>',
				viz: {
					type: 'obs-bar',
					title: 'Biomarkers after 30 days of UPF',
					subtitle: 'Indexed to pre-diet baseline = 100',
					unit: '',
					data: [
					{ label: 'Cholesterol', group: 'Before UPF diet', value: 100, color: '#0a0a0a18' },
					{ label: 'Cholesterol', group: 'After 30 days', value: 145, color: '#b45309' },
					{ label: 'CRP (inflammation)', group: 'Before UPF diet', value: 100, color: '#0a0a0a18' },
					{ label: 'CRP (inflammation)', group: 'After 30 days', value: 160, color: '#be185d' }
					],
					sourceId: 'van-tulleken-2023'
				}
			},
			{
				id: 'conclusion',
				text: 'Thirty days. One diet. One body. Every metric pointed the same way: this isn’t food behaving badly. It’s a different kind of substance entirely.',
				richText:
					'Thirty days. One diet. One body. Every metric pointed the same way: this isn’t food behaving badly. <strong>It’s a different kind of substance entirely.</strong>',
				quote: {
					text: 'Ultra-processed products are food that lies to us.',
					attribution: 'Dr Chris van Tulleken',
					sourceId: 'van-tulleken-2023'
				}
			}
		],
		sources: ['van-tulleken-2023']
	},
	{
		id: 'body-under-siege',
		number: 4,
		eyebrow: 'Chapter 4',
		emoji: '🌭',
		title: 'The Body Under Siege',
		intro:
			'The largest pooled study ever conducted on UPF set out to find adverse health effects. It found them — across nearly every organ system in the human body.',
		accent: 'red',
		steps: [
			{
				id: 'scale',
				text: 'In February 2024, the BMJ published an umbrella review pooling nearly 10 million participants.',
				stat: {
					value: '9.9',
					unit: 'M',
					label: 'people studied across 45 pooled analyses.',
					sourceId: 'bmj-2024'
				}
			},
			{
				id: 'cvd',
				text: 'Higher UPF intake was associated with a sharply higher risk of dying of cardiovascular disease.',
				stat: {
					value: '+50',
					unit: '%',
					label: 'increased risk of cardiovascular mortality.',
					context: 'Class I evidence — the highest grade in the review.',
					sourceId: 'bmj-2024'
				}
			},
			{
				id: 'mental',
				text: 'And the effect wasn’t only physical. Anxiety and common mental disorders rose with consumption.',
				stat: {
					value: '+53',
					unit: '%',
					label: 'higher risk of common mental disorders.',
					sourceId: 'bmj-2024'
				}
			},
			{
				id: 'all-cause',
				text: 'The bottom line, drawn across every disease bucket the review examined:',
				stat: {
					value: '+21',
					unit: '%',
					label: 'increased risk of all-cause mortality.',
					context:
						'Dying earlier, of any cause, simply because more of the diet is ultra-processed.',
					sourceId: 'bmj-2024'
				}
			},
			{
				id: 'health-risks',
				text: 'The scale of elevated risk, across every major disease category, is striking.',
				viz: {
					type: 'obs-bar',
					title: 'Increased risk from high UPF consumption',
					subtitle: 'BMJ umbrella review, 2024 — n ≈ 9.9 million participants',
					prefix: '+',
					unit: '%',
					data: [
					{ label: 'Mental health disorders', value: 53, color: '#be185d' },
					{ label: 'Cardiovascular mortality', value: 50, color: '#be185d' },
					{ label: 'Anxiety disorders', value: 48, color: '#6d28d9' },
					{ label: 'Type 2 diabetes', value: 40, color: '#6d28d9' },
					{ label: 'Depression', value: 22, color: '#b45309' },
					{ label: 'All-cause mortality', value: 21, color: '#b45309' },
					{ label: 'Cancer mortality', value: 16, color: '#1e3a5f' }
					],
					sourceId: 'bmj-2024'
				}
			}
		],
		sources: ['bmj-2024']
	},
	{
		id: 'engineered-to-addict',
		number: 5,
		eyebrow: 'Chapter 5',
		emoji: '🧁',
		title: 'Engineered to Addict',
		intro:
			'The point of UPF — from the perspective of the company that made it — is not nutrition. The point is that you can’t stop eating it.',
		accent: 'pink',
		steps: [
			{
				id: 'thesis',
				text: 'UPF is, by van Tulleken’s account, specifically engineered to drive excess consumption. Soft. Calorie-dense. Fast to chew. Slow to satiate.',
				richText:
					'UPF is, by van Tulleken’s account, <strong>specifically engineered to drive excess consumption.</strong> Soft. Calorie-dense. <strong>Fast to chew. Slow to satiate.</strong>',
				viz: {
					type: 'image',
					name: 'upf-bread',
					alt: 'Sliced factory-made white bread — soft, calorie-dense, fast to chew.',
					caption: 'Mass-produced sliced bread — the archetypal ultra-processed staple.',
					sourceId: 'daily-record-upf-good',
					credit: '© Getty Images — via Daily Record (dailyrecord.co.uk), reproduced for editorial commentary'
				}
			},
			{
				id: 'dopamine',
				text: 'In MRI studies, UPF triggers reward-pathway activity that mirrors patterns documented in substance use disorders.',
				richText:
					'In MRI studies, UPF triggers <strong>reward-pathway activity</strong> that mirrors patterns documented in <strong>substance use disorders.</strong>',
				viz: {
					type: 'obs-bar',
					title: 'Adults meeting clinical addiction criteria',
					subtitle: 'UPF — Nature Medicine (2025); tobacco / alcohol / cannabis — WHO global estimates',
					unit: '% of adults',
					data: [
						{ label: 'Ultra-processed food', value: 14, color: '#be185d' },
						{ label: 'Tobacco', value: 12, color: '#b45309' },
						{ label: 'Alcohol', value: 5, color: '#6d28d9' },
						{ label: 'Cannabis', value: 2, color: '#1e3a5f' }
					],
					sourceId: 'who-addiction-2024'
				}
			},
			{
				id: 'addiction-prevalence',
				text: 'A 2025 Nature Medicine synthesis of 300 studies put the addiction rate in concrete terms.',
				stat: {
					value: '14',
					unit: '%',
					label: 'of adults worldwide meet criteria for UPF addiction.',
					sourceId: 'nature-medicine-2025'
				}
			},
			{
				id: 'youth',
				text: 'Among young people, the rate is almost the same — suggesting UPF addiction sets in early.',
				stat: {
					value: '15',
					unit: '%',
					label: 'of young people meet criteria for UPF addiction.',
					sourceId: 'nature-medicine-2025'
				}
			}
		],
		sources: ['nature-medicine-2025', 'who-addiction-2024', 'daily-record-upf-good']
	},
	{
		id: 'regulatory-vacuum',
		number: 6,
		eyebrow: 'Chapter 6',
		emoji: '🥪',
		title: 'The Regulatory Vacuum',
		intro:
			'Most additives in the US food supply are deemed safe by the company that introduced them. There is no requirement to tell the FDA.',
		accent: 'amber',
		steps: [
			{
				id: 'gras',
				text: 'Under the GRAS system — Generally Recognised As Safe — companies can self-certify the safety of new ingredients. Many never appear on a regulator’s desk at all.',
				richText:
					'Under the <a data-term="gras">GRAS system</a> — Generally Recognised As Safe — <strong>companies can self-certify the safety of new ingredients.</strong> Many <strong>never appear on a regulator’s desk at all.</strong>',
				viz: {
					type: 'obs-bar',
					title: 'What 417 global UPF regulations actually do',
					subtitle: 'Nat Food, 2025 — global audit of UPF-related regulatory measures',
					unit: '%',
					data: [
						{ label: 'Coverage', group: 'Labelling / food environment only', value: 86, color: '#be185d' },
						{ label: 'Coverage', group: 'Production or marketing controls', value: 14, color: '#1e3a5f' },
						{ label: 'Enforceability', group: 'Non-binding (voluntary / consensus)', value: 47, color: '#b45309' },
						{ label: 'Enforceability', group: 'Legally binding', value: 53, color: '#6d28d9' }
					],
					sourceId: 'nat-food-2025'
				}
			},
			{
				id: 'measures',
				text: 'A global scan of regulatory measures found only modest action so far.',
				stat: {
					value: '417',
					label: 'total UPF-related regulatory measures identified worldwide.',
					sourceId: 'nat-food-2025'
				}
			},
			{
				id: 'environment',
				text: 'And of those, most do not touch what gets made or how it is sold.',
				stat: {
					value: '85.9',
					unit: '%',
					label:
						'only address the food environment — labels, signage — not production or marketing.',
					sourceId: 'nat-food-2025'
				}
			}
		],
		sources: ['nat-food-2025', 'van-tulleken-2023']
	},
	{
		id: 'inequality',
		number: 7,
		eyebrow: 'Chapter 7',
		emoji: '🍟',
		title: 'A Disease of Inequality',
		intro:
			'The people who eat the most UPF are not the ones who chose it. They are the ones for whom it is, very often, all that is on the shelf.',
		accent: 'red',
		steps: [
			{
				id: 'access',
				text: 'For lower-income families and people in deprived areas, UPF can account for as much as 80% of total calories — not by preference but by price, time, and what local shops actually stock.',
				richText:
					'For lower-income families and people in deprived areas, UPF can account for <strong>as much as 80% of total calories</strong> — not by preference but by <strong>price, time, and what local shops actually stock.</strong>',
				viz: {
					type: 'obs-bar',
					title: 'UPF share of total calorie intake',
					subtitle: 'By population group — van Tulleken (2023) and supporting research',
					unit: '% of calories',
					data: [
						{ label: 'Deprived areas (UK)', value: 80, color: '#be185d' },
						{ label: 'UK / USA average adult', value: 57, color: '#b45309' },
						{ label: 'Higher-income groups', value: 45, color: '#6d28d9' },
						{ label: 'Japan / South Korea', value: 22, color: '#1e3a5f' }
					],
					sourceId: 'van-tulleken-2023'
				}
			},
			{
				id: 'marketing',
				text: 'Food companies disproportionately target children and lower-income consumers. UPF becomes not just dinner but a cultural identity, deliberately constructed by marketing departments.',
				richText:
					'Food companies disproportionately target children and lower-income consumers. UPF becomes not just dinner but <strong>a cultural identity, deliberately constructed by marketing departments.</strong>',
			},
			{
				id: 'south-africa',
				text: 'In South Africa, the pattern is sharper still. By 2024, nearly half of all adults were overweight or obese — even as almost two-thirds of households remained food-insecure. The HSRC calls this the double burden of malnutrition: hunger and obesity living in the same kitchen.',
				richText:
					'In South Africa, the pattern is sharper still. By 2024, <strong>nearly half of all adults were overweight or obese</strong> — even as almost two-thirds of households remained food-insecure. The HSRC calls this the <a href="#" data-term="double-burden">double burden of malnutrition</a>: <strong>hunger and obesity living in the same kitchen.</strong>',
				viz: {
					type: 'obs-bar',
					title: 'South Africa\'s double burden',
					subtitle: 'Adults overweight or obese — HSRC National Food & Nutrition Security Survey (2024)',
					unit: '% of adults',
					data: [
						{ label: 'Women', value: 68, color: '#be185d' },
						{ label: 'All adults', value: 49, color: '#b45309' },
						{ label: 'Men', value: 38, color: '#6d28d9' }
					],
					sourceId: 'hsrc-nfnss-2024'
				}
			},
			{
				id: 'frame',
				text: 'Van Tulleken argues this means the obesity crisis is misframed as a problem of personal willpower, when it is in fact a problem of who has been given a real choice and who has not.',
				richText: 'Van Tulleken argues this means the obesity crisis is <strong>misframed as a problem of personal willpower</strong>, when it is in fact a problem of <strong>who has been given a real choice</strong> and who has not.',
				quote: {
					text: 'Obesity is a commerciogenic disease — driven by a largely unregulated industry.',
					attribution: 'Dr Chris van Tulleken',
					sourceId: 'van-tulleken-2023'
				}
			}
		],
		sources: ['van-tulleken-2023', 'hsrc-nfnss-2024']
	},
	{
		id: 'eating-the-planet',
		number: 8,
		eyebrow: 'Chapter 8',
		emoji: '🌮',
		title: 'Eating the Planet',
		intro:
			'The cheap commodity ingredients of UPF — soy, corn, palm — are the same crops driving deforestation and the bulk of food-system emissions.',
		accent: 'amber',
		steps: [
			{
				id: 'crops',
				text: 'Most of the planet’s tropical rainforest loss now serves a small set of monocrops grown to be processed: soy for animal feed, corn for syrup and starches, palm for shelf-stable fats.',
				richText:
					'<strong>Most of the planet’s tropical rainforest loss</strong> now serves a small set of monocrops grown to be processed: soy for animal feed, corn for syrup and starches, <strong>palm for shelf-stable fats.</strong>',
				viz: {
					type: 'obs-bar',
					title: 'Causes of tropical deforestation',
					subtitle: 'Share of total forest loss — Global Forest Watch 2022',
					unit: '%',
					data: [
						{ label: 'Cattle ranching', value: 41, color: '#be185d' },
						{ label: 'Commercial crops (soy, palm, corn)', value: 26, color: '#b45309' },
						{ label: 'Subsistence farming', value: 13, color: '#0a0a0a40' },
						{ label: 'Logging', value: 13, color: '#0a0a0a30' },
						{ label: 'Other causes', value: 7, color: '#0a0a0a20' }
					],
					sourceId: 'gfw-2022'
				}
			},
			{
				id: 'supply-chain',
				text: 'A single ultra-processed product can contain ingredients that have travelled from a dozen countries. The mechanical processing and the global supply chains together account for a significant share of food-system greenhouse emissions.',
				richText:
					'A single ultra-processed product can contain ingredients that have <strong>travelled from a dozen countries.</strong> The mechanical processing and the global supply chains together account for <strong>a significant share of food-system greenhouse emissions.</strong>',
				viz: {
					type: 'obs-bar',
					title: 'Estimated CO₂ footprint by food category',
					subtitle: 'kg CO₂e per kg of food — approximate, varies by production method',
					unit: 'kg CO₂e / kg',
					data: [
						{ label: 'Beef (factory farmed)', value: 27, color: '#be185d' },
						{ label: 'Ultra-processed snack', value: 9, color: '#b45309' },
						{ label: 'Cheese', value: 6, color: '#b45309' },
						{ label: 'Processed ready meal', value: 4, color: '#6d28d9' },
						{ label: 'Canned food', value: 2, color: '#6d28d9' },
						{ label: 'Vegetables (fresh)', value: 1, color: '#1e3a5f' }
					],
					sourceId: 'our-world-in-data-food-co2'
				}
			},
			{
				id: 'frame',
				text: 'Stack the deforestation, the global supply chains, and the carbon cost on top of each other and a single conclusion becomes hard to avoid.',
				richText:
					'Stack the <strong>deforestation</strong>, the <strong>global supply chains</strong>, and the <strong>carbon cost</strong> on top of each other and a single conclusion becomes hard to avoid.',
				quote: {
					text: 'UPF is the single biggest driver of environmental destruction in the food system.',
					attribution: 'Dr Chris van Tulleken',
					sourceId: 'van-tulleken-2023'
				}
			}
		],
		sources: ['van-tulleken-2023']
	},
	{
		id: 'what-now',
		number: 9,
		eyebrow: 'Chapter 9',
		emoji: '🥤',
		title: 'What Now?',
		intro:
			'There is no clean exit from a food system this large. There are, however, levers — and they begin with what gets counted as food at all.',
		accent: 'pink',
		steps: [
			{
				id: 'ten-percent',
				text: 'Replacing even a small fraction of UPF with minimally processed food produces measurable health gains across cancer, metabolic, and mortality outcomes.',
				stat: {
					value: '10',
					unit: '%',
					label: 'swap from UPF to whole food → measurable risk reductions.',
					sourceId: 'bmj-2024'
				}
			},
			{
				id: 'policy',
				text: 'The Lancet UPF Series sets out the policy menu: front-of-pack labels that name UPF, marketing restrictions, tax revenue redirected into food access, and a duty of care on the companies themselves.',
				richText:
					'The Lancet UPF Series sets out the policy menu: <strong>front-of-pack labels</strong> that name UPF, <strong>marketing restrictions</strong>, tax revenue redirected into food access, and <strong>a duty of care on the companies themselves.</strong>',
				viz: {
					type: 'obs-bar',
					title: 'Cancer risk: high UPF consumers vs low',
					subtitle: 'Increased risk — IARC / WHO multinational study (2023)',
					prefix: '+',
					unit: '%',
					data: [
						{ label: 'Pancreatic cancer', value: 49, color: '#be185d' },
						{ label: 'Colorectal cancer', value: 30, color: '#b45309' },
						{ label: 'Overall cancer risk*', value: 13, color: '#6d28d9' },
						{ label: 'Breast cancer', value: 11, color: '#1e3a5f' }
					],
					sourceId: 'iarc-who-2023'
				}
			},
			{
				id: 'close',
				text: 'This is not a problem of personal willpower. It is a problem of who designs the food environment, who profits from it, and who pays.',
				richText:
					'This is not a problem of personal willpower. It is a problem of <strong>who designs the food environment</strong>, <strong>who profits from it</strong>, and <strong>who pays.</strong>',
				quote: {
					text: 'We must take back control of our diets and prioritise whole, nourishing foods.',
					attribution: 'Dr Chris van Tulleken',
					sourceId: 'van-tulleken-2023'
				}
			}
		],
		sources: ['bmj-2024', 'lancet-upf-series-2025', 'van-tulleken-2023']
	}
];

// UPF % by country — for BubbleChart
export const upfByCountry: BubbleDataPoint[] = [
	{ label: 'UK', value: 60, category: 'red' },
	{ label: 'USA', value: 60, category: 'red' },
	{ label: 'Canada', value: 45, category: 'amber' },
	{ label: 'Australia', value: 42, category: 'amber' },
	{ label: 'France', value: 35, category: 'pink' },
	{ label: 'Brazil', value: 20, category: 'ink' },
	{ label: 'Spain', value: 24, category: 'pink' },
	{ label: 'Mexico', value: 30, category: 'amber' },
	{ label: 'India', value: 10, category: 'ink' },
	{ label: 'Japan', value: 8, category: 'ink' },
];

// Health impact bars — for BarChart
export const healthImpacts: BarDataPoint[] = [
	{ label: 'All-cause mortality', value: 21, category: 'red' },
	{ label: 'Cardiovascular mortality', value: 50, category: 'red' },
	{ label: 'Cancer mortality', value: 16, category: 'amber' },
	{ label: 'Mental health disorders', value: 53, category: 'pink' },
];

// UPF % by year — for BarChart (showing UK/USA escalation over time)
export const upfByYear: BarDataPoint[] = [
	{ label: 'UK / USA', value: 10, category: 'ink', year: 1980 },
	{ label: 'UK / USA', value: 20, category: 'ink', year: 1990 },
	{ label: 'UK / USA', value: 32, category: 'ink', year: 2000 },
	{ label: 'UK / USA', value: 45, category: 'ink', year: 2010 },
	{ label: 'UK / USA', value: 57, category: 'ink', year: 2020 },
	{ label: 'UK / USA', value: 60, category: 'red', year: 2024 },
];

// UPF trend over time — for LineChart
export const upfTrend: LineSeries[] = [
	{
		name: 'UK / USA',
		color: '#be185d',
		data: [
			{ year: 1980, value: 10 }, { year: 1990, value: 20 },
			{ year: 2000, value: 32 }, { year: 2010, value: 45 },
			{ year: 2020, value: 57 }, { year: 2024, value: 60 }
		]
	},
	{
		name: 'Brazil',
		color: '#b45309',
		data: [
			{ year: 1980, value: 5 }, { year: 1990, value: 8 },
			{ year: 2000, value: 13 }, { year: 2010, value: 18 },
			{ year: 2020, value: 20 }, { year: 2024, value: 22 }
		]
	}
];

// UPF vs whole foods — for DonutChart (80% UPF / 20% whole)
export const upfVsWhole: DonutDataPoint[] = [
	{ label: 'Ultra-processed', value: 80, color: '#be185d' },
	{ label: 'Whole foods', value: 20, color: '#1e3a5f' },
];

// NOVA groups — for DonutChart
export const novaBreakdown: DonutDataPoint[] = [
	{ label: 'Group 1', value: 30, color: '#1e3a5f' },
	{ label: 'Group 2', value: 5, color: '#6d28d9' },
	{ label: 'Group 3', value: 10, color: '#b45309' },
	{ label: 'Group 4', value: 55, color: '#be185d' },
];
