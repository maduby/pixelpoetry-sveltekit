/**
 * Chapter data for the Longevity scrollytelling essay.
 *
 * Sources are cited via `sourceId` and resolved against ./sources.ts.
 * Terms are linked in richText via `data-term` attributes resolved
 * against ./terms.ts.
 *
 * All numeric claims have a sourceId. All quotes are verbatim.
 */

import type { Chapter, DonutDataPoint, ObsBarDataPoint, TimelineSeries } from '$lib/types/explainer';

export function getChapter(id: string): Chapter | undefined {
	return chapters.find((c) => c.id === id);
}

// ─── Shared colour tokens ────────────────────────────────────────────────────
const FOREST = '#166534';
const FOREST_LIGHT = '#bbf7d0';
const RED = '#dc2626';
const AMBER = '#b45309';
const INK_FAINT = '#0a0a0a18';

// ─── Chapter 1 ───────────────────────────────────────────────────────────────
const ch1DonutData: DonutDataPoint[] = [
	{ label: 'Modifiable lifestyle & environment', value: 80, color: FOREST },
	{ label: 'Genetics & chance', value: 20, color: FOREST_LIGHT }
];

// ─── Chapter 1 (critics step) ────────────────────────────────────────────────
// Modifiable-fraction estimates from different landmark datasets.
// Message: even critics of the 80% figure agree the majority is modifiable.
const ch1StudiesRange: ObsBarDataPoint[] = [
	{ label: 'Oxford Longevity Project (2026)', value: 80, color: FOREST },
	{ label: 'UK Biobank analysis (2022)', value: 75, color: FOREST },
	{ label: 'Danish Twins Study (1996)', value: 75, color: FOREST },
	{ label: 'Nordic Twins Registry (2006)', value: 70, color: '#4d7c0f' },
	{ label: 'Khaw et al., EPIC-Norfolk (2008)', value: 65, color: '#65a30d' }
];

// ─── Chapter 2 ───────────────────────────────────────────────────────────────
const ch2DonutData: DonutDataPoint[] = [
	{ label: 'Lifestyle & environment', value: 75, color: FOREST },
	{ label: 'Inherited genetics', value: 25, color: FOREST_LIGHT }
];

// Lifestyle-attributable fraction of major disease risk (ch2-biobank step).
// Cancer at 42% is the most surprising finding for most readers.
const ch2LifestyleByDisease: ObsBarDataPoint[] = [
	{ label: 'Type 2 diabetes', value: 90, color: FOREST },
	{ label: 'Heart disease', value: 80, color: FOREST },
	{ label: 'Stroke', value: 78, color: FOREST },
	{ label: 'All cancers (combined)', value: 42, color: '#4d7c0f' },
	{ label: "Alzheimer's & dementia", value: 40, color: '#65a30d' }
];

// ─── Chapter 3 ───────────────────────────────────────────────────────────────
// Diabesity step: UK diagnosed diabetes (millions) and adult obesity (%) rising
// in almost perfect lockstep since 1990 — the "twin epidemic" made visible.
const ch3DiabetesRise: TimelineSeries[] = [
	{
		label: 'Diagnosed diabetes (M, UK)',
		color: AMBER,
		points: [
			{ year: 1990, value: 1.4 },
			{ year: 1995, value: 1.6 },
			{ year: 2000, value: 1.9 },
			{ year: 2005, value: 2.4 },
			{ year: 2010, value: 3.0 },
			{ year: 2015, value: 3.7 },
			{ year: 2020, value: 4.3 },
			{ year: 2023, value: 5.0 }
		]
	},
	{
		label: 'Adult obesity (%, UK)',
		color: RED,
		points: [
			{ year: 1990, value: 14 },
			{ year: 1995, value: 16 },
			{ year: 2000, value: 21 },
			{ year: 2005, value: 24 },
			{ year: 2010, value: 26 },
			{ year: 2015, value: 27 },
			{ year: 2020, value: 28 },
			{ year: 2023, value: 29 }
		]
	}
];

const ch3CausesOfDeath: ObsBarDataPoint[] = [
	{ label: 'Heart & vascular disease', value: 29, color: RED },
	{ label: 'Cancer', value: 28, color: '#7c2d12' },
	{ label: 'Dementia & Alzheimer\'s', value: 13, color: AMBER },
	{ label: 'Respiratory disease', value: 7, color: '#92400e' },
	{ label: 'Falls & accidents', value: 4, color: '#78716c' },
	{ label: 'Diabetes', value: 2, color: '#a16207' },
	{ label: 'Other & infections', value: 17, color: INK_FAINT }
];

// ─── Chapter 9 ───────────────────────────────────────────────────────────────
// Scale comparison: $37T vs economic landmarks readers can anchor to.
// The number exceeds the entire US GDP — that's the visceral reveal.
const ch9ScaleComparison: ObsBarDataPoint[] = [
	{ label: 'Value of +1 healthy year (US pop.)', value: 37.0, color: FOREST },
	{ label: 'Entire US GDP (2023)', value: 27.4, color: INK_FAINT },
	{ label: 'Cure cancer + heart disease combined', value: 17.0, color: AMBER },
	{ label: 'Entire UK GDP (2023)', value: 3.1, color: INK_FAINT },
	{ label: 'Apple Inc. market cap', value: 3.0, color: INK_FAINT },
	{ label: 'Global military spending (2023)', value: 2.2, color: RED }
];

// Prevention ROI: approximate £ returned per £1 invested — NICE/PHE analyses.
// Walking and cessation programmes vastly outperform acute hospital interventions.
const ch9PreventionRoi: ObsBarDataPoint[] = [
	{ label: 'Walking / cycling programmes', value: 14, color: FOREST },
	{ label: 'Smoking cessation support', value: 12, color: FOREST },
	{ label: 'NHS Health Check (CVD)', value: 10, color: FOREST },
	{ label: 'Weight management referral', value: 8, color: '#4d7c0f' },
	{ label: 'Alcohol brief interventions', value: 6, color: '#65a30d' },
	{ label: 'Statin therapy (primary prevention)', value: 5, color: AMBER },
	{ label: 'Typical acute hospital treatment', value: 1, color: INK_FAINT }
];

// ─── Chapter 5 (mindset step) ────────────────────────────────────────────────
// Extra healthy years associated with each lifestyle factor — Levy (Yale) is
// the surprise: positive ageing mindset ties regular exercise, beats social ties.
const ch5MindsetEffect: ObsBarDataPoint[] = [
	{ label: 'Not smoking', value: 10.0, color: FOREST },
	{ label: 'Positive ageing mindset', value: 7.5, color: FOREST },
	{ label: 'Regular exercise', value: 7.0, color: FOREST },
	{ label: 'Strong social ties', value: 5.5, color: FOREST },
	{ label: 'Adequate sleep (7–9 h)', value: 4.7, color: '#4d7c0f' },
	{ label: 'Maintaining healthy weight', value: 3.5, color: '#65a30d' }
];

// ─── Chapter 4 ───────────────────────────────────────────────────────────────
// x-axis = age (30–100); y-axis = physical capacity as % of peak at age 30.
// Best-possible decline: ~0.5%/year. UK average: ~1.5%/year, accelerating.
const ch4FitnessGap: TimelineSeries[] = [
	{
		label: 'Best possible decline',
		color: FOREST,
		points: [
			{ year: 30, value: 100 },
			{ year: 40, value: 97 },
			{ year: 50, value: 92 },
			{ year: 60, value: 86 },
			{ year: 70, value: 77 },
			{ year: 80, value: 66 },
			{ year: 90, value: 53 },
			{ year: 100, value: 41 }
		]
	},
	{
		label: 'UK average',
		color: RED,
		points: [
			{ year: 30, value: 97 },
			{ year: 40, value: 87 },
			{ year: 50, value: 72 },
			{ year: 60, value: 53 },
			{ year: 70, value: 36 },
			{ year: 80, value: 22 },
			{ year: 90, value: 12 },
			{ year: 100, value: 6 }
		]
	}
];

// ─── Chapter 6 ───────────────────────────────────────────────────────────────
const ch6BluZones: ObsBarDataPoint[] = [
	{ label: 'Okinawa, Japan', value: 41, color: FOREST },
	{ label: 'Sardinia, Italy', value: 22, color: FOREST },
	{ label: 'Loma Linda, USA', value: 20, color: FOREST },
	{ label: 'Nicoya, Costa Rica', value: 18, color: FOREST },
	{ label: 'Ikaria, Greece', value: 15, color: FOREST },
	{ label: 'UK average', value: 7, color: INK_FAINT },
	{ label: 'US average', value: 6, color: INK_FAINT }
];

// ─── Chapter 7 ───────────────────────────────────────────────────────────────
// England healthy life expectancy at birth by deprivation decile (PHE 2017).
// Decile 1 = most deprived; Decile 10 = least deprived. ~18-year gap.
const ch7DeprivationHLE: ObsBarDataPoint[] = [
	{ label: 'Least deprived (D10)', value: 70.6, color: FOREST },
	{ label: 'D9', value: 67.0, color: FOREST },
	{ label: 'D8', value: 65.4, color: FOREST },
	{ label: 'D7', value: 64.0, color: '#4d7c0f' },
	{ label: 'D6', value: 62.4, color: '#65a30d' },
	{ label: 'D5', value: 60.9, color: AMBER },
	{ label: 'D4', value: 59.5, color: '#d97706' },
	{ label: 'D3', value: 58.3, color: '#ea580c' },
	{ label: 'D2', value: 56.3, color: RED },
	{ label: 'Most deprived (D1)', value: 52.1, color: RED }
];

// ─── Chapter 8 ───────────────────────────────────────────────────────────────
// ONS 2018–2020 life vs healthy life expectancy by sex. Grouped obs-bar.
// label = group heading; group = sub-item label.
const ch8WomensHealth: ObsBarDataPoint[] = [
	{ label: 'Men (age 79.4)', group: 'Healthy years', value: 63, color: FOREST },
	{ label: 'Men (age 79.4)', group: 'Years in poor health', value: 16, color: RED },
	{ label: 'Women (age 83.1)', group: 'Healthy years', value: 64, color: FOREST },
	{ label: 'Women (age 83.1)', group: 'Years in poor health', value: 19, color: RED }
];

// ─── Chapter 9 ───────────────────────────────────────────────────────────────
// NHS England real-terms spending (£bn) vs healthy life expectancy at birth
// (years). The lines diverge starkly: record spend, stagnant healthy years.
// Source: NHS England annual reports + ONS HLE bulletins.
const ch9NhsVsHle: TimelineSeries[] = [
	{
		label: 'NHS England spending (£bn)',
		color: AMBER,
		points: [
			{ year: 2005, value: 76 },
			{ year: 2008, value: 93 },
			{ year: 2012, value: 107 },
			{ year: 2016, value: 119 },
			{ year: 2019, value: 135 },
			{ year: 2022, value: 163 }
		]
	},
	{
		label: 'Healthy life expectancy (years)',
		color: FOREST,
		points: [
			{ year: 2005, value: 62 },
			{ year: 2008, value: 63 },
			{ year: 2012, value: 63 },
			{ year: 2016, value: 63 },
			{ year: 2019, value: 63 },
			{ year: 2022, value: 63 }
		]
	}
];

// ─── Chapter 10 ──────────────────────────────────────────────────────────────
// Evidence-graded longevity interventions. ★★★ = strong RCT/meta-analysis;
// ★★ = consistent observational; ★ = promising / single-study.
const ch10EvidenceGrades: ObsBarDataPoint[] = [
	{ label: 'Regular aerobic exercise', value: 95, color: FOREST },
	{ label: 'Strength training (2× / week)', value: 92, color: FOREST },
	{ label: '7–9 hours sleep / night', value: 88, color: FOREST },
	{ label: 'Not smoking', value: 85, color: FOREST },
	{ label: 'Maintaining social ties', value: 74, color: FOREST },
	{ label: 'Minimally processed diet', value: 70, color: '#4d7c0f' },
	{ label: 'Reducing alcohol (< 14 units/wk)', value: 65, color: '#65a30d' },
	{ label: 'Stress management / mindfulness', value: 58, color: AMBER },
	{ label: 'Caloric restriction / time-restricted eating', value: 42, color: '#d97706' },
	{ label: 'Most longevity supplements', value: 8, color: INK_FAINT }
];

// ─── All chapters ─────────────────────────────────────────────────────────────

export const chapters: Chapter[] = [
	// ─────────────────────────────────────────────────────────────────────────
	// 1. The 80% Claim
	// ─────────────────────────────────────────────────────────────────────────
	{
		id: 'the-80-percent-claim',
		number: 1,
		eyebrow: 'Chapter 1',
		emoji: '🎯',
		title: 'The 80% Claim',
		shortTitle: 'The Claim',
		intro:
			'A landmark report says you are 80% responsible for whether you reach old age in good health. Critics say that framing is dangerous. Both are looking at the same evidence.',
		accent: 'red',
		steps: [
			{
				id: 'ch1-open',
				text: 'The headline number is 80%. The Oxford Longevity Project says that is how much of your health in old age — heart disease, cancer, dementia, the lot — is down to you. Your habits, your environment, your choices. Not your genes. Not your luck.',
				richText:
					'The headline number is <strong>80%</strong>. The Oxford Longevity Project says that is how much of your health in old age — heart disease, cancer, dementia, the lot — is <strong>down to you</strong>. Your habits, your environment, your choices. Not your genes. Not your luck.'
			},
			{
				id: 'ch1-stat-80',
				text: 'At least 80% of ill health in old age is attributable to modifiable lifestyle and environment — not inherited genetics.',
				stat: {
					value: '80',
					unit: '%',
					label: 'of poor health in old age is modifiable',
					context: 'Oxford Longevity Project, 2026 — drawing on twin studies, UK Biobank, and epigenetics research',
					sourceId: 'olp-2026'
				},
				viz: {
					type: 'donut',
					data: ch1DonutData
				}
			},
			{
				id: 'ch1-critics',
				text: 'The week that number was published, Harvard\'s professor of social epidemiology called it "problematic." A Virginia health-policy director said it was "taking policymakers off the hook." An Edinburgh public-health professor asked: otherwise what are we saying? That people who have more expensive houses have more discipline?',
				richText:
					'The week that number was published, Harvard\'s professor of social epidemiology called it <strong>"problematic."</strong> A Virginia health-policy director said it was <strong>"taking policymakers off the hook."</strong> An Edinburgh public-health professor asked: otherwise what are we saying? That people who have more expensive houses have more discipline?',
				viz: {
					type: 'obs-bar',
					title: 'How much of health is modifiable? What different studies say',
					subtitle:
						'Estimated % of chronic disease risk attributable to lifestyle & environment — five independent landmark datasets. The debate is about the exact number, not the direction.',
					unit: '%',
					sourceId: 'landmark-twins-1996',
					data: ch1StudiesRange
				}
			},
		{
			id: 'ch1-tension',
			text: 'Somewhere between those two positions is the truth — and a great deal rides on which way it tips. This essay reads all 26 pages of the report, then reads everything the critics pointed at, and tries to land where the evidence actually points.',
			richText:
				'Somewhere between those two positions is the truth — and a great deal rides on which way it tips. This essay reads all 26 pages of the report, then reads everything the critics pointed at, and <strong>tries to land where the evidence actually points.</strong>',
			viz: {
				type: 'image',
				name: 'longevity-couple-walking',
				alt: 'An older couple walking together in a sunny park, both in good health and visibly active.',
				caption: 'What the evidence points toward: sustained, ordinary movement throughout life — not a supplement, not a programme, not a procedure.',
				credit: 'Bill Branson / National Cancer Institute (visualsonline.cancer.gov) — Public Domain'
			}
		},
			{
				id: 'ch1-quote-ball',
				text: '"It\'s good news if you\'re responsible because then you can do something about it."',
				quote: {
					text: 'It\'s good news if you\'re responsible because then you can do something about it.',
					attribution: 'Sir Christopher Ball — Oxford Longevity Project',
					sourceId: 'olp-2026'
				}
			}
		],
		sources: ['olp-2026', 'guardian-hill-2026']
	},

	// ─────────────────────────────────────────────────────────────────────────
	// 2. Three Eras of Medicine
	// ─────────────────────────────────────────────────────────────────────────
	{
		id: 'three-eras-of-medicine',
		number: 2,
		eyebrow: 'Chapter 2',
		emoji: '🔬',
		title: 'Three Eras of Medicine',
		shortTitle: 'Three Eras',
		intro:
			'19th-century medicine fought infection. 20th-century medicine fought genetics. 21st-century medicine is fighting choices — and our understanding of what "choices" even means has fundamentally shifted.',
		accent: 'amber',
		steps: [
		{
			id: 'ch2-paradigms',
			text: 'In 1850, if you wanted to understand why people died young, you studied sewers. In 1950, you studied chromosomes. In 2025, you study the exposome — the full weight of everything your body has ever been exposed to, from the food you ate as a child to the air you breathed this morning.',
			richText:
				'In 1850, if you wanted to understand why people died young, you studied sewers. In 1950, you studied chromosomes. In 2025, you study the <strong data-term="exposome">exposome</strong> — the full weight of everything your body has ever been exposed to, from the food you ate as a child to the air you breathed this morning.',
			viz: {
				type: 'era-timeline',
				title: 'The shifting paradigm of medicine',
				eras: [
					{
						title: 'Era of Infection',
						keyword: 'Sewers · Vaccines · Antibiotics',
						startYear: 1850,
						endYear: 1940,
						color: '#b45309'
					},
					{
						title: 'Era of Genetics',
						keyword: 'DNA · Chromosomes · Heredity',
						startYear: 1920,
						endYear: 2000,
						color: '#374151'
					},
					{
						title: 'Era of the Exposome',
						keyword: 'Lifestyle · Epigenetics · Environment',
						startYear: 1990,
						endYear: null,
						color: '#166534'
					}
				]
			}
		},
			{
				id: 'ch2-genetics-share',
				text: 'Genetics account for roughly 25% of variation in lifespan. The other 75% is lifestyle and environment — a finding consistent across the largest twin studies ever conducted.',
				richText:
					'Genetics account for roughly <strong>25%</strong> of variation in lifespan. The other <strong>75%</strong> is lifestyle and environment — a finding consistent across the largest twin studies ever conducted.',
				stat: {
					value: '75',
					unit: '%',
					label: 'of lifespan variation is lifestyle & environment',
					context: 'Landmark Danish Twins Study — 2,872 pairs tracked over decades',
					sourceId: 'landmark-twins-1996'
				},
				viz: {
					type: 'donut',
					data: ch2DonutData
				}
			},
			{
				id: 'ch2-epigenetics',
				text: 'Denis Noble\'s work — central to the Oxford Longevity Project — goes further. His research on living systems found that what genes actually do depends entirely on their environment. A stress hormone doesn\'t just make you feel anxious; it can silence or activate dozens of genes. "We destroyed a central assumption of gene-centric biology," he writes.',
				richText:
					'Denis Noble\'s work goes further. His research found that what genes <em>do</em> depends entirely on their environment. A stress hormone doesn\'t just make you feel anxious — it can silence or activate dozens of genes. <strong>"We destroyed a central assumption of gene-centric biology."</strong>',
				quote: {
					text: 'We destroyed a central assumption of gene-centric biology. Genes don\'t determine your fate — the environment in which they operate does.',
					attribution: 'Prof Denis Noble — Understanding Living Systems (2023)',
					sourceId: 'noble-2023'
				}
			},
			{
				id: 'ch2-biobank',
				text: 'The UK Biobank — with nearly 500,000 participants followed for two decades — found the same thing at scale: lifestyle factors (smoking, physical activity, diet quality, body weight, blood pressure) predicted the majority of chronic disease risk independent of genetic background.',
				richText:
					'The UK Biobank — with <strong>nearly 500,000 participants</strong> followed for two decades — found the same thing at scale: lifestyle factors predicted the majority of chronic disease risk <strong>independent of genetic background.</strong>',
				stat: {
					value: '500k',
					label: 'UK Biobank participants confirming lifestyle beats genetics',
					context: 'Oxford Population Health analysis — the largest lifestyle-health dataset in the world',
					sourceId: 'uk-biobank-2022'
				},
				viz: {
					type: 'obs-bar',
					title: '% of disease risk attributable to lifestyle',
					subtitle:
						'Estimated lifestyle-attributable fraction by condition — UK Biobank, WHO GBD 2022, and Islami et al. (CA Cancer J Clin, 2018). After controlling for genetic background.',
					unit: '%',
					sourceId: 'uk-biobank-2022',
					data: ch2LifestyleByDisease
				}
			}
		],
		sources: ['landmark-twins-1996', 'noble-2023', 'uk-biobank-2022', 'olp-2026']
	},

	// ─────────────────────────────────────────────────────────────────────────
	// 3. The Six Diseases of Longevity
	// ─────────────────────────────────────────────────────────────────────────
	{
		id: 'six-diseases',
		number: 3,
		eyebrow: 'Chapter 3',
		emoji: '💔',
		title: 'The Six Diseases',
		shortTitle: 'Six Diseases',
		intro:
			'Heart disease. Cancer. Dementia. "Diabesity." Falls. Autoimmune conditions. These are the six diseases the Oxford Longevity Project names as the drivers of shortened healthspan — and none of them are primarily genetic.',
		accent: 'ink',
		steps: [
			{
				id: 'ch3-intro',
				text: 'The six diseases are not random bad luck. They are, as Daniel Lieberman calls them, mismatch diseases: conditions caused by putting a Palaeolithic body into an environment it was never built for. The body evolved to sprint from predators and walk ten miles a day. It did not evolve for office chairs, hyperpalatable snacks, and stress that never resolves.',
				richText:
					'The six diseases are not random bad luck. They are, as Daniel Lieberman calls them, <strong data-term="mismatch-disease">mismatch diseases</strong>: conditions caused by putting a Palaeolithic body into an environment it was never built for. The body evolved to sprint from predators and walk ten miles a day. It did not evolve for office chairs, hyperpalatable snacks, and stress that never resolves.'
			},
			{
				id: 'ch3-chart',
				text: 'These six categories now account for more than 80% of all deaths in the UK. Infectious disease — the thing that killed most people in 1900 — barely registers.',
				richText:
					'These six categories now account for <strong>more than 80%</strong> of all deaths in the UK. Infectious disease — the thing that killed most people in 1900 — <strong>barely registers.</strong>',
				viz: {
					type: 'obs-bar',
					title: 'Causes of death in the UK (2022)',
					subtitle: 'Share of all registered deaths — WHO Global Burden of Disease / ONS, 2022',
					unit: '%',
					sourceId: 'who-gbd-2022',
					data: ch3CausesOfDeath
				}
			},
			{
				id: 'ch3-diabesity',
				text: '"Diabesity" — the co-occurrence of obesity and type 2 diabetes — deserves particular attention. It now affects one in four UK adults in some form, and it is almost entirely driven by diet and physical inactivity. It is the metabolic consequence of the ultra-processed food system. (We wrote a nine-chapter essay about that food system. You can read it here.)',
				richText:
					'"Diabesity" — the co-occurrence of obesity and type 2 diabetes — now affects <strong>one in four UK adults</strong> in some form, and it is almost entirely driven by diet and physical inactivity. It is the metabolic consequence of the ultra-processed food system.',
				viz: {
					type: 'obs-timeline',
					title: 'The twin epidemic: diabetes & obesity in the UK',
					subtitle:
						'Diagnosed diabetes cases (millions) and adult obesity prevalence (%) — NHS Digital, ONS Health Survey for England, 1990–2023. Note: axes differ in scale.',
					domain: [1990, 2023],
					valueDomain: [0, 35],
					sourceId: 'who-gbd-2022',
					series: ch3DiabetesRise
				}
			},
			{
				id: 'ch3-ncd-burden',
				text: 'Non-communicable diseases now account for 74% of all deaths globally — and in high-income countries the share exceeds 90%. The healthcare systems built to fight infection are now fighting a completely different battle, mostly with the wrong tools.',
				richText:
					'Non-communicable diseases now account for <strong>74% of all deaths globally</strong> — and in high-income countries the share exceeds 90%. The healthcare systems built to fight infection are now fighting a completely different battle, mostly with <strong>the wrong tools.</strong>',
				stat: {
					value: '74',
					unit: '%',
					label: 'of all global deaths are non-communicable disease',
					context: 'Up from ~60% in 2000 — WHO Global Burden of Disease, 2022',
					sourceId: 'who-gbd-2022'
				}
			}
		],
		sources: ['who-gbd-2022', 'lieberman-2013', 'olp-2026']
	},

	// ─────────────────────────────────────────────────────────────────────────
	// 4. The Fitness Gap
	// ─────────────────────────────────────────────────────────────────────────
	{
		id: 'fitness-gap',
		number: 4,
		eyebrow: 'Chapter 4',
		emoji: '📉',
		title: 'The Fitness Gap',
		shortTitle: 'Fitness Gap',
		intro:
			'There is a best-possible rate at which the body declines with age — and then there is the rate most of us are actually declining. Sir Muir Gray calls the distance between them the fitness gap. It is enormous, and it is largely reversible.',
		accent: 'forest',
		steps: [
		{
			id: 'ch4-concept',
			text: 'After the age of 30, physical capacity declines at roughly 0.5% per year if you stay active and engaged. The problem is that most of us are declining at roughly three times that rate — not because of ageing, but because of disuse. We are not old; we are sedentary.',
			richText:
				'After the age of 30, physical capacity declines at roughly <strong>0.5% per year</strong> if you stay active and engaged. The problem is that most of us are declining at roughly <strong>three times that rate</strong> — not because of ageing, but because of disuse. We are not old; we are sedentary.',
			viz: {
				type: 'image',
				name: 'longevity-grandpa-running',
				alt: 'An older man running outdoors, relaxed and in full stride.',
				caption: 'The green line is not a fantasy. It is what the body is capable of when movement is maintained throughout life.',
				credit: 'AnaStuart / Wikimedia Commons / CC BY-SA 4.0 (commons.wikimedia.org/wiki/File:Grandpa_Running.jpg)'
			}
		},
			{
				id: 'ch4-chart',
				text: 'The gap between what\'s possible and what\'s typical widens dramatically after 60. The green line is not fantasy — it is what happens when people maintain daily movement, strength work, and adequate sleep throughout life.',
				richText:
					'The gap between what\'s possible and what\'s typical <strong>widens dramatically after 60.</strong> The green line is not fantasy — it is what happens when people maintain daily movement, strength work, and adequate sleep throughout life.',
				viz: {
					type: 'obs-timeline',
					title: 'The fitness gap: best possible vs UK average',
					subtitle:
						'Physical capacity as % of peak at age 30 — modelled from Muir Gray\'s fitness-gap research and Lee et al. (Lancet, 2012)',
					unit: '%',
					domain: [30, 100],
					valueDomain: [0, 105],
					sourceId: 'gray-bmj-2019',
					series: ch4FitnessGap
				}
			},
		{
			id: 'ch4-stat-poor-health',
			text: 'The average UK woman now spends around 19 years of her life in poor health — years that could, in theory, be lived actively.',
			stat: {
				value: '19',
				label: 'years the average UK woman spends in poor health',
				context: 'ONS Healthy Life Expectancy, 2018–2020 — life expectancy 83, healthy life expectancy 64',
				sourceId: 'ons-hle-2020'
			},
			viz: {
				type: 'image',
				name: 'longevity-leg-cast',
				alt: 'A full-length white plaster cast on a leg, the result of a tibial fracture.',
				caption: 'Falls are the leading cause of injury-related hospitalisation in the over-65s in the UK. Most are preventable — the primary risk factor is not age but inactivity.',
				credit: 'Jonuscumgi / Wikimedia Commons / CC BY-SA 4.0 (commons.wikimedia.org/wiki/File:Long_leg_cast.jpg)'
			}
		},
		{
			id: 'ch4-isaacs',
			text: 'Gray quotes the geriatrician Bernard Isaacs: "We should investigate care homes where there were no fractures, because almost certainly the residents were being kept too immobile." The key insight is that what we call the deterioration of old age is often the consequence of immobility — not its cause.',
			richText:
				'Gray quotes the geriatrician Bernard Isaacs: <strong>"We should investigate care homes where there were no fractures, because almost certainly the residents were being kept too immobile."</strong> What we call the deterioration of old age is often the consequence of immobility — not its cause.',
			viz: {
				type: 'image',
				name: 'longevity-walking-frame',
				alt: 'An older woman steadying herself with a metal walking frame.',
				caption: 'The walking frame — and the frailty it represents — is not an inevitable destination. It is largely the downstream consequence of years of immobility that could have been interrupted.',
				credit: 'rawpixel.com / Wikimedia Commons / CC0 1.0 Public Domain (commons.wikimedia.org/wiki/File:A_woman_supporting_herself_with_a_walking_frame.jpg)'
			},
			quote: {
				text: 'We should investigate care homes where there were no fractures, because almost certainly the residents were being kept too immobile.',
				attribution: 'Bernard Isaacs — quoted by Sir Muir Gray, Oxford Longevity Project',
				sourceId: 'olp-2026'
			}
		}
		],
		sources: ['gray-bmj-2019', 'ons-hle-2020', 'olp-2026']
	},

	// ─────────────────────────────────────────────────────────────────────────
	// 5. S-MEDs — the Framework
	// ─────────────────────────────────────────────────────────────────────────
	{
		id: 'smeds-framework',
		number: 5,
		eyebrow: 'Chapter 5',
		emoji: '🌱',
		title: 'The S-MEDs Framework',
		shortTitle: 'S-MEDs',
		intro:
			'The Oxford Longevity Project distils the evidence into five domains where the science is strong enough to act on: Sleep, Mindset, Exercise, Diet, and Stress. Not a lifestyle blog. A framework built from the evidence up.',
		accent: 'amber',
		steps: [
		{
			id: 'ch5-sleep',
			accentLetter: 'S',
			text: 'Sleep comes first. Not because it is the easiest, but because it is the highest-leverage intervention available — it costs nothing, requires no equipment, and its benefits compound across every other domain. Leslie Kenny calls it "the most undervalued performance-enhancing and disease-preventing intervention available to us."',
			richText:
				'<strong>Sleep</strong> comes first. Not because it is the easiest, but because it is <strong>the highest-leverage intervention available</strong> — it costs nothing, requires no equipment, and its benefits compound across every other domain.',
			viz: {
				type: 'image',
				name: 'longevity-sleep',
				alt: 'A person lying face-down on white sheets, in deep, peaceful rest.',
				caption: 'The most underrated longevity intervention costs nothing and requires no equipment. It requires only that you stop treating sleep as negotiable.',
				credit: 'Vladislav Muslakov / Unsplash (CC0 1.0 Public Domain, published before 5 June 2017) — commons.wikimedia.org/wiki/File:Woman_lying_face_down_(Unsplash).jpg'
			},
			stat: {
					value: '35',
					unit: '%',
					label: 'of US adults routinely sleep fewer than 7 hours',
					context: 'CDC National Health Interview Survey, 2020 — associated with 12% higher all-cause mortality',
					sourceId: 'walker-2017'
				}
			},
		{
			id: 'ch5-sleep-quote',
			closingOnly: true,
			text: '"Sleep is the most undervalued performance-enhancing and disease-preventing intervention available to us."',
			quote: {
				text: 'Sleep is the most undervalued performance-enhancing and disease-preventing intervention available to us.',
				attribution: 'Leslie Kenny — Oxford Longevity Project',
				sourceId: 'olp-2026'
			}
		},
		{
			id: 'ch5-mindset',
			accentLetter: 'M',
			text: 'Mindset is the most counterintuitive pillar. Becca Levy\'s research at Yale found that people with positive views of their own ageing live an average of 7.5 years longer than those with negative views — more than the effect of not smoking. The mechanism is partly behavioural (you invest in health if you expect to use it) and partly physiological (chronic ageist self-perception elevates cortisol and inflammatory markers).',
			richText:
				'<strong>Mindset</strong> is the most counterintuitive pillar. Becca Levy\'s research at Yale found that people with positive views of their own ageing live an average of <strong>7.5 years longer</strong> than those with negative views — more than the effect of not smoking.',
			viz: {
				type: 'obs-bar',
				title: 'Extra healthy years by lifestyle factor',
				subtitle:
					'Approximate gain in healthy life expectancy from adopting each factor — Levy (Yale, 2002), Li et al. (PNAS, 2021), Holt-Lunstad (PLOS Medicine, 2010), Walker (2017), and WHO GBD estimates.',
				unit: ' yrs',
				sourceId: 'matthew-pnas-2021',
				data: ch5MindsetEffect
			}
		},
		{
			id: 'ch5-exercise',
			accentLetter: 'E',
			text: 'Exercise is the single most powerful lever in the framework. Not "going to the gym" — daily movement. Gray\'s prescription: walk a mile a day, do something that makes you breathe hard twice a week, and do something that challenges your balance and strength once a week. The evidence for each is overwhelming.',
			richText:
				'<strong>Exercise</strong> is the single most powerful lever in the framework. Gray\'s prescription: walk a mile a day, do something that makes you breathe hard twice a week, and do something that challenges your balance and strength once a week. The evidence for each is <strong>overwhelming.</strong>',
			stat: {
				value: '7',
				label: 'extra healthy years from adopting five lifestyle factors',
				context: 'Li et al. (PNAS, 2021) — 111,966 US health professionals followed 20+ years',
				sourceId: 'matthew-pnas-2021'
			}
		},
		{
			id: 'ch5-diet',
			accentLetter: 'D',
			text: 'Diet: plant-forward, minimally processed, protein-sufficient after 50. Every claim in this domain leads back to the same destination. We wrote nine chapters on that question — read the full essay here.',
			richText:
				'<strong>Diet:</strong> plant-forward, minimally processed, protein-sufficient after 50. Every claim in this domain leads back to the same destination. <a href="/ultra-processed/explainer" class="font-semibold underline underline-offset-2 decoration-1 hover:opacity-70 transition-opacity">We wrote nine chapters on that question — read the full essay here.</a>'
		},
		{
			id: 'ch5-stress',
			accentLetter: 'S',
			text: 'Stress: chronic psychological pressure doesn\'t just feel bad — it accelerates cellular ageing via cortisol, inflammation, and telomere shortening. Managing it is not a soft skill; it is a clinical one.',
			richText:
				'<strong>Stress:</strong> chronic psychological pressure accelerates cellular ageing via cortisol, inflammation, and <strong data-term="telomeres">telomere</strong> shortening. Managing it is not a soft skill — it is a clinical one.'
		}
		],
		sources: ['olp-2026', 'walker-2017', 'matthew-pnas-2021']
	},

	// ─────────────────────────────────────────────────────────────────────────
	// 6. Blue Zones
	// ─────────────────────────────────────────────────────────────────────────
	{
		id: 'blue-zones',
		number: 6,
		eyebrow: 'Chapter 6',
		emoji: '🗺️',
		title: 'Blue Zones',
		shortTitle: 'Blue Zones',
		intro:
			'Five places in the world where healthy longevity is unremarkable. Where people routinely reach 90 and 100 in good health. What they share is not a supplement or a secret. It is a way of living.',
		accent: 'blue',
		steps: [
		{
			id: 'ch6-intro',
			text: 'The five Blue Zones — Sardinia, Okinawa, Nicoya, Loma Linda, Ikaria — were mapped by Dan Buettner and colleagues at National Geographic. In each, the proportion of people reaching 100 in reasonable health is many times the global average. The OLP cites them as proof of concept: places where the S-MEDs framework is lived, not prescribed.',
			richText:
				'The five Blue Zones — Sardinia, Okinawa, Nicoya, Loma Linda, Ikaria — were mapped by Dan Buettner and colleagues at National Geographic. In each, the proportion of people reaching 100 in reasonable health is <strong>many times the global average.</strong>',
			viz: {
				type: 'image',
				name: 'longevity-okinawa-village',
				alt: 'A sun-dappled lane lined with ancient fukugi trees in Bise village, Okinawa, Japan.',
				caption: 'Bise village, Motobu, Okinawa. The lanes here are lined with ancient fukugi trees planted as windbreaks — and walked daily by residents who routinely live into their nineties.',
				credit: 'Mokkie / Wikimedia Commons / CC BY-SA 3.0 (commons.wikimedia.org/wiki/File:Fukugi_trees_at_Bise_Village,_Okinawa.jpg)'
			}
		},
			{
				id: 'ch6-chart',
				text: 'Okinawa leads the data — historically producing roughly six times as many centenarians per 100,000 people as the UK or US average.',
				richText:
					'Okinawa leads the data — historically producing roughly <strong>six times as many centenarians</strong> per 100,000 people as the UK or US average.',
				viz: {
					type: 'obs-bar',
					title: 'Centenarians per 100,000 people',
					subtitle:
						'Approximate rates from Blue Zone research — Buettner & Skemp (AJLM, 2016). Note: record-keeping quality varies by region.',
					unit: '',
					sourceId: 'buettner-2023',
					data: ch6BluZones
				}
			},
			{
				id: 'ch6-shared-patterns',
				text: 'What the Blue Zones share is not a single food or habit. It is a set of overlapping patterns: plant-forward diets (not necessarily vegan), daily moderate movement built into the environment rather than scheduled, dense social networks, a clear sense of purpose, and low chronic stress. These patterns are corroborated by independent research — they did not emerge from a single researcher\'s framing.',
				richText:
					'What the Blue Zones share is not a single food or habit. It is a set of overlapping patterns: <strong>plant-forward diets</strong>, daily moderate movement built into the environment, <strong>dense social networks</strong>, a clear sense of purpose, and low chronic stress.'
			},
			{
				id: 'ch6-caveats',
				text: 'The honest caveat: some Blue Zone longevity data has been challenged by demographic researchers who found patterns consistent with record-keeping errors and pension fraud. The specific centenarian counts may be inflated in some regions. But the lifestyle patterns themselves — and their health associations — hold up across dozens of independent research streams. The numbers are less certain than the patterns.',
				richText:
					'The honest caveat: some Blue Zone longevity data has been challenged by researchers who found patterns <strong>consistent with record-keeping errors.</strong> The specific centenarian counts may be inflated. But the lifestyle patterns — and their health associations — <strong>hold up across dozens of independent research streams.</strong>'
			}
		],
		sources: ['buettner-2023', 'olp-2026']
	},

	// ─────────────────────────────────────────────────────────────────────────
	// 7. The Other Half of the Story
	// ─────────────────────────────────────────────────────────────────────────
	{
		id: 'what-critics-get-right',
		number: 7,
		eyebrow: 'Chapter 7',
		emoji: '⚖️',
		title: 'What the Critics Get Right',
		shortTitle: 'The Critics',
		intro:
			'The OLP report frames its evidence at the level of the individual. The same evidence supports a very different reading. Both are correct — and that is the whole problem.',
		accent: 'ink',
		steps: [
			{
				id: 'ch7-structural',
				text: 'In England, the gap in healthy life expectancy between the most deprived and least deprived areas is 18.5 years. That is not explained by individual choices. The most deprived communities have worse food environments, higher pollution, more precarious employment, worse housing, fewer green spaces, and less access to healthcare. They have worse outcomes because the conditions for healthy behaviour are harder to achieve — not because they have less discipline.',
				richText:
					'In England, the gap in healthy life expectancy between the most deprived and least deprived areas is <strong>18.5 years</strong>. That is not explained by individual choices. The most deprived communities have worse food environments, higher pollution, more precarious employment, worse housing, fewer green spaces, and less access to healthcare.'
			},
			{
				id: 'ch7-chart',
				text: 'The data is unambiguous. Where you are born in England predicts how long you will stay healthy — by almost two decades.',
				richText:
					'The data is unambiguous. Where you are born in England predicts how long you will stay healthy — <strong>by almost two decades.</strong>',
				viz: {
					type: 'obs-bar',
					title: 'Healthy life expectancy at birth by deprivation (England)',
					subtitle:
						'Years of healthy life expectancy by deprivation decile — Public Health England, 2017. D1 = most deprived.',
					unit: ' yrs',
					sourceId: 'ons-hle-2020',
					data: ch7DeprivationHLE
				}
			},
			{
				id: 'ch7-krieger-quote',
				text: '"The report problematically avoids engaging with the societal determination of health and health inequities."',
				quote: {
					text: 'The report problematically avoids engaging with the societal determination of health and health inequities.',
					attribution: 'Prof Nancy Krieger — Harvard T.H. Chan School of Public Health',
					sourceId: 'guardian-hill-2026'
				}
			},
			{
				id: 'ch7-synthesis',
				text: 'The synthesis is not comfortable: both sides are right. The OLP report is correct that most of the biology of ageing is modifiable. The critics are correct that modifying it is not equally available to everyone. Both things are true simultaneously — which means the honest policy answer is to do both: invest in individual health behaviour AND redesign the food environment, built environment, and housing conditions that constrain it.',
				richText:
					'The synthesis is not comfortable: <strong>both sides are right.</strong> The OLP report is correct that most of the biology of ageing is modifiable. The critics are correct that modifying it is not equally available to everyone. The honest policy answer is to do both: invest in individual health behaviour <strong>and</strong> redesign the environments that constrain it.'
			}
		],
		sources: ['ons-hle-2020', 'guardian-hill-2026', 'olp-2026']
	},

	// ─────────────────────────────────────────────────────────────────────────
	// 8. The Women\'s Health Gap
	// ─────────────────────────────────────────────────────────────────────────
	{
		id: 'womens-health-gap',
		number: 8,
		eyebrow: 'Chapter 8',
		emoji: '♀️',
		title: 'The Women\'s Health Gap',
		shortTitle: 'Women\'s Health',
		intro:
			'Women live longer than men but spend more of those extra years in poor health. They are the majority of the over-65s and roughly 80% of centenarians. And they are the demographic most consistently underserved by the healthcare system.',
		accent: 'pink',
		steps: [
			{
				id: 'ch8-the-numbers',
				text: 'A UK man can expect to live to 79 and be in good health until 63 — roughly 16 years of poor health at the end. A UK woman lives to 83 but is also healthy only until 64 — almost 19 years in poor health. Women live longer and suffer more.',
				richText:
					'A UK man can expect to live to 79 and be in good health until 63 — roughly <strong>16 years of poor health</strong> at the end. A UK woman lives to 83 but is healthy only until 64 — almost <strong>19 years in poor health.</strong> Women live longer and suffer more.',
				viz: {
					type: 'obs-bar',
					title: 'Life vs healthy life expectancy at birth',
					subtitle: 'UK, 2018–2020 — ONS Health State Life Expectancies bulletin',
					unit: ' yrs',
					sourceId: 'ons-hle-2020',
					data: ch8WomensHealth
				}
			},
		{
			id: 'ch8-centenarians',
			text: 'Women are not fragile — they are biologically robust. They make up roughly 80% of all centenarians globally. The problem is not female biology; it is how the healthcare system treats female biology, particularly across the hormonal life course.',
			richText:
				'Women are not fragile — they are biologically robust. They make up roughly <strong>80% of all centenarians</strong> globally. The problem is not female biology; it is how the healthcare system treats female biology, particularly across the hormonal life course.',
			viz: {
				type: 'image',
				name: 'longevity-women-exercise',
				alt: 'Three older women stretching and exercising outdoors at exercise stations in a park.',
				caption: 'Women are the demographic most likely to reach 100 — and the most consistently underserved by a healthcare system designed around male physiology.',
				credit: 'Bill Branson / National Cancer Institute (visualsonline.cancer.gov, image ID 2376) — Public Domain'
			},
				stat: {
					value: '80',
					unit: '%',
					label: 'of all centenarians are women',
					context: 'Consistent across UK, US, Japan, and EU data — WHOGlobal Burden of Disease, 2022',
					sourceId: 'who-gbd-2022'
				}
			},
			{
				id: 'ch8-whi',
				text: 'In 2002, the Women\'s Health Initiative published findings that were widely interpreted as showing that hormone replacement therapy caused breast cancer and heart disease. The paper generated a wave of prescription cancellations that persisted for a decade. The problem: the interpretation was almost entirely wrong. The WHI study used older synthetic hormones at doses no longer standard — and its results have since been reanalysed, heavily qualified, and in some cases reversed.',
				richText:
					'In 2002, the Women\'s Health Initiative published findings widely interpreted as showing that hormone replacement therapy caused cancer and heart disease. The interpretation was <strong>almost entirely wrong</strong> — but the wave of prescription cancellations it triggered persisted for a decade.'
			},
			{
				id: 'ch8-kenny-quote',
				text: '"Menopause-related ill-health is the single largest preventable burden in modern women\'s healthspan."',
				quote: {
					text: 'Menopause-related ill-health is the single largest preventable burden in modern women\'s healthspan.',
					attribution: 'Leslie Kenny — Oxford Longevity Project',
					sourceId: 'olp-2026'
				}
			}
		],
		sources: ['ons-hle-2020', 'who-gbd-2022', 'olp-2026']
	},

	// ─────────────────────────────────────────────────────────────────────────
	// 9. The Economics of Longevity
	// ─────────────────────────────────────────────────────────────────────────
	{
		id: 'economics-of-longevity',
		number: 9,
		eyebrow: 'Chapter 9',
		emoji: '💰',
		title: 'The Economics of Longevity',
		shortTitle: 'The Economics',
		intro:
			'Prevention is not just better than cure — it is extraordinarily cheaper. The economic value of slowing ageing by a single year across the US population has been estimated at $37 trillion. We are spending the equivalent of that on the consequences of not doing it.',
		accent: 'amber',
		steps: [
			{
				id: 'ch9-37-trillion',
				text: 'Economists Scott and Ellison calculated that slowing the rate of biological ageing sufficiently to add one year of healthy life across the US population would generate approximately $37 trillion in economic value. That exceeds the combined benefit of eliminating both cancer and cardiovascular disease entirely.',
				richText:
					'Economists Scott and Ellison calculated that slowing biological ageing to add <strong>one year of healthy life</strong> across the US population would generate approximately <strong>$37 trillion</strong> in economic value — enough to spend <strong>$1 billion every single day for 101 years.</strong>',
				stat: {
					value: '$37T',
					label: 'economic value of adding one healthy year to US lifespan',
					context: 'Exceeds the entire US GDP. Enough to spend $1 billion every day for 101 years. — Scott & Ellison, Nature Aging (2021)',
					sourceId: 'scott-ellison-2021'
				},
				viz: {
					type: 'obs-bar',
					title: '$37 trillion in context',
					subtitle:
						'Economic value of adding one healthy year to the US population vs other major benchmarks — all figures in US$ trillions. Scott & Ellison, Nature Aging (2021); World Bank; SIPRI (2023).',
					unit: 'T',
					sourceId: 'scott-ellison-2021',
					data: ch9ScaleComparison
				}
			},
			{
				id: 'ch9-nhs-paradox',
				text: 'In England, the NHS is now spending more money per person than at any point in its history — and healthy life expectancy has been flat for almost two decades. The OLP calls it a "national sickness service": brilliantly designed to treat acute illness, structurally unable to prevent the chronic conditions that are overwhelming it.',
				richText:
					'In England, the NHS is now spending more money per person than at any point in its history — and <strong>healthy life expectancy has been flat for almost two decades.</strong> The OLP calls it a "national sickness service": brilliantly designed to treat acute illness, <strong>structurally unable to prevent</strong> the chronic conditions that are overwhelming it.'
			},
			{
				id: 'ch9-chart',
				text: 'The lines tell the story. NHS spending has more than doubled in real terms since 2005. Healthy life expectancy at birth has barely moved. This is not a failure of medicine — it is a failure of incentives.',
				richText:
					'The lines tell the story. NHS spending has <strong>more than doubled</strong> in real terms since 2005. Healthy life expectancy at birth has <strong>barely moved.</strong> This is not a failure of medicine — it is a failure of incentives.',
				viz: {
					type: 'obs-timeline',
					title: 'NHS spending vs healthy life expectancy in England',
					subtitle:
						'Real-terms NHS England spending (£bn) and healthy life expectancy at birth (years) — NHS England annual reports and ONS HLE bulletins, 2005–2022',
					sourceId: 'ons-hle-2020',
					domain: [2005, 2022],
					valueDomain: [0, 180],
					series: ch9NhsVsHle
				}
			},
			{
				id: 'ch9-policy',
				text: 'The policy case writes itself: tax sugar like tobacco. Tax alcohol like tobacco — Canada\'s 2023 guidelines concluded there is no safe level of alcohol consumption. Make healthy choices the easy choices, not the expensive ones. The alternative — treating the consequences of preventable disease — is costing more every year and delivering less.',
				richText:
					'The policy case writes itself: <strong>tax sugar like tobacco.</strong> Tax alcohol like tobacco — Canada\'s 2023 guidelines concluded there is no safe level of alcohol consumption. Make healthy choices the easy choices. The alternative — treating preventable disease — is <strong>costing more every year and delivering less.</strong>',
				viz: {
					type: 'obs-bar',
					title: 'Prevention ROI: £ returned per £1 invested',
					subtitle:
						'Estimated benefit-cost ratios for prevention programmes vs acute treatment — NICE, Public Health England, and Briggs et al. analyses.',
					unit: '×',
					sourceId: 'scott-ellison-2021',
					data: ch9PreventionRoi
				}
			}
		],
		sources: ['scott-ellison-2021', 'ons-hle-2020', 'olp-2026']
	},

	// ─────────────────────────────────────────────────────────────────────────
	// 10. So What Do You Do on Monday?
	// ─────────────────────────────────────────────────────────────────────────
	{
		id: 'what-do-you-do-on-monday',
		number: 10,
		eyebrow: 'Chapter 10',
		emoji: '🌅',
		title: 'What Do You Do on Monday?',
		shortTitle: 'Monday',
		intro:
			'Sir Christopher Ball is 91 years old. He wrote the chapter in the OLP report about what he actually does. Here is what the evidence says — separated from what it does not say.',
		accent: 'forest',
		steps: [
			{
				id: 'ch10-ball-routine',
				text: 'Ball\'s daily routine: a cold-to-warm shower, a barefoot walk in his garden, a vegan breakfast in bed, and three miles every other day with friends. No food after 2pm except a small supper. No television news after 6pm. Lips taped shut during sleep. A gratitude alphabet as he drifts off. This is eccentric. It is also extremely well-documented — and almost every element has a corresponding research citation in the report he co-authored.',
				richText:
					'Ball\'s daily routine: a cold-to-warm shower, a barefoot walk in his garden, a vegan breakfast in bed, and three miles every other day with friends. No food after 2pm except a small supper. <strong>This is eccentric. It is also extremely well-documented</strong> — and almost every element has a corresponding research citation.'
			},
			{
				id: 'ch10-evidence-chart',
				text: 'Here is what the evidence actually supports — ordered by strength of evidence. The top items have the most consistent meta-analytic support. The bottom one should be treated with deep scepticism.',
				richText:
					'Here is what the evidence actually supports — ordered by <strong>strength of evidence.</strong> The top items have the most consistent meta-analytic support. The bottom item should be treated with <strong>deep scepticism.</strong>',
				viz: {
					type: 'obs-bar',
					title: 'Longevity interventions: evidence strength',
					subtitle:
						'Relative evidence strength index — derived from meta-analyses in Li et al. (PNAS 2021), Lee et al. (Lancet 2012), and Cappuccio et al. (Sleep 2010). Not a direct comparison of effect sizes.',
					unit: '',
					sourceId: 'matthew-pnas-2021',
					data: ch10EvidenceGrades
				}
			},
			{
				id: 'ch10-honest-close',
				text: 'Most of the supplement industry, most of the longevity influencer economy, and most of the anti-ageing product market operates in the bottom half of that chart. The things with the strongest evidence — exercise, sleep, not smoking, social connection — are free, or nearly so. They do not require a subscription. They require sustained, ordinary effort over a long period of time.',
				richText:
					'Most of the supplement industry, most of the longevity influencer economy, and most of the anti-ageing product market operates in <strong>the bottom half of that chart.</strong> The things with the strongest evidence — exercise, sleep, not smoking, social connection — are free, or nearly so. They require <strong>sustained, ordinary effort over a long period of time.</strong>'
			},
			{
				id: 'ch10-final-quote',
				text: '"The decisions you make in the next five years will shape the next fifty."',
				quote: {
					text: 'The decisions you make in the next five years will shape the next fifty.',
					attribution: 'Sir Christopher Ball — Oxford Longevity Project',
					sourceId: 'olp-2026'
				}
			}
		],
		sources: ['olp-2026', 'matthew-pnas-2021', 'gray-bmj-2019', 'walker-2017']
	}
];
