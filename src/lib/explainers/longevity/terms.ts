/**
 * Inline term definitions — shown in the bottom sheet when a [data-term] link
 * is clicked in the story text.
 */

import type { Term } from '$lib/types/explainer';

export type { Term };

export const terms: Record<string, Term> = {
	healthspan: {
		id: 'healthspan',
		name: 'Healthspan',
		short:
			'The number of years you live in good health — free from serious illness, disability, or cognitive decline.',
		long: 'Healthspan is distinct from lifespan. The UK average woman currently lives to 83 but has a healthspan of roughly 64 — meaning almost two decades of her life are spent in poor health. The goal of longevity science is not simply to add years to life, but to add life to years: compressing the period of decline into as short a window as possible before death.',
		url: 'https://www.ons.gov.uk/peoplepopulationandcommunity/healthandsocialcare/healthandlifeexpectancies',
		urlLabel: 'ONS: Health state life expectancies'
	},
	exposome: {
		id: 'exposome',
		name: 'The Exposome',
		short:
			'Everything your body is exposed to across a lifetime — air, food, stress, movement, relationships — and how that shapes your biology.',
		long: 'Coined by epidemiologist Christopher Wild in 2005, the exposome is the environmental counterpart to the genome. It captures all non-genetic exposures from conception to death. Longevity researchers argue that the exposome explains far more variance in lifespan and healthspan than genetic inheritance — the Landmark Twins Study suggests genetics account for only ~25% of longevity; the rest is exposome.',
		url: 'https://www.niehs.nih.gov/research/supported/exposure/exposome',
		urlLabel: 'NIH: The Exposome and Health'
	},
	'fitness-gap': {
		id: 'fitness-gap',
		name: 'The Fitness Gap',
		short:
			'The widening space between how fast we could decline physically with age, and how fast most of us actually do.',
		long: 'Coined by Sir Muir Gray, the fitness gap describes the difference between the best-possible rate of age-related physical decline (roughly 0.5% per year after peak fitness at ~30) and the actual rate most sedentary adults experience (roughly 1.5–2% per year). Gray argues that the majority of what we attribute to "ageing" is actually disuse — and that it is largely reversible at any age with appropriate exercise.',
		url: 'https://www.bmj.com',
		urlLabel: 'BMJ: Physical activity and healthy ageing'
	},
	smeds: {
		id: 'smeds',
		name: 'S-MEDs',
		short:
			'The Oxford Longevity Project framework: Sleep, Mindset, Exercise, Diet, and Stress — the five domains where evidence is strongest for extending healthspan.',
		long: 'S-MEDs was developed by the Oxford Longevity Project to organise the evidence-based levers for healthy ageing. It stands for Sleep (the foundational pillar), Mindset (including ageism as a self-fulfilling prophecy), Exercise (the single most powerful intervention), Diet (minimally processed, protein-sufficient after 50), and Stress (chronic psychological stress accelerates cellular ageing via cortisol and telomere shortening). The lowercase "s" for Stress reflects that, while important, it operates partly via its effects on the other four.'
	},
	ncds: {
		id: 'ncds',
		name: 'Non-Communicable Diseases',
		short:
			'Diseases that do not spread from person to person. They are usually long-term conditions shaped by biology, environment, behaviour, and policy.',
		long: '<p>Non-communicable diseases, often shortened to NCDs, include cardiovascular disease, cancer, chronic respiratory disease, diabetes, dementia, and many mental health conditions.</p><p>They are not infections. You do not catch them from another person. Instead, risk accumulates over time through a mix of genetics, ageing, diet, movement, smoking, alcohol, air pollution, stress, housing, work, poverty, and access to healthcare.</p><p>That is why the phrase matters in this essay: modern health systems were largely built to fight acute infectious disease, but most deaths now come from chronic conditions that need prevention, long-term support, and healthier environments.</p>',
		url: 'https://www.who.int/news-room/fact-sheets/detail/noncommunicable-diseases',
		urlLabel: 'WHO: Noncommunicable diseases'
	},
	'blue-zones': {
		id: 'blue-zones',
		name: 'Blue Zones',
		short:
			'Five geographic regions where people consistently live significantly longer, healthier lives than the global average.',
		long: 'Identified by Dan Buettner and colleagues at National Geographic, the five original Blue Zones are: Barbagia, Sardinia (Italy); Okinawa (Japan); Nicoya Peninsula (Costa Rica); Loma Linda, California (USA); and Ikaria (Greece). All five share common patterns: a largely plant-based diet, daily moderate movement baked into the environment, strong social and community ties, a sense of purpose, and low chronic stress. Some researchers have challenged specific centenarian counts (particularly in Sardinia), but the underlying lifestyle patterns are corroborated by independent research.',
		url: 'https://doi.org/10.1177/1559827616637066',
		urlLabel: 'Buettner & Skemp (2016) — American Journal of Lifestyle Medicine'
	},
	'hallmarks-of-ageing': {
		id: 'hallmarks-of-ageing',
		name: 'The Hallmarks of Ageing',
		short:
			'The nine fundamental biological processes that drive cellular deterioration over time — from DNA damage to chronic inflammation.',
		long: 'First published by López-Otín et al. in Cell (2013) and updated in 2023, the Hallmarks of Ageing are: genomic instability, telomere attrition, epigenetic alterations, loss of proteostasis, deregulated nutrient sensing, mitochondrial dysfunction, cellular senescence, stem cell exhaustion, and altered intercellular communication. Lifestyle factors (exercise, diet, sleep) have been shown to positively modulate all nine hallmarks — suggesting that while ageing is inevitable, its pace is not fixed.',
		url: 'https://doi.org/10.1016/j.cell.2022.11.001',
		urlLabel: 'López-Otín et al. (2023) — Cell'
	},
	telomeres: {
		id: 'telomeres',
		name: 'Telomeres',
		short:
			'Protective caps on the ends of chromosomes that shorten every time a cell divides — a biological clock for cellular ageing.',
		long: "Like the plastic tips on shoelaces, telomeres protect chromosomes from fraying during cell division. Each division shortens them slightly. When they become critically short, the cell stops dividing or self-destructs (apoptosis). Telomere length is a proxy measure of cellular ageing: chronic stress, smoking, obesity, and poor sleep accelerate shortening; regular aerobic exercise, adequate sleep, and stress management slow it. Nobel laureate Elizabeth Blackburn's work on telomeres and telomerase won the 2009 Nobel Prize in Physiology.",
		url: 'https://www.nobelprize.org/prizes/medicine/2009/press-release/',
		urlLabel: 'Nobel Prize in Physiology 2009'
	},
	epigenetics: {
		id: 'epigenetics',
		name: 'Epigenetics',
		short:
			'Changes in how genes are expressed — which genes get switched on or off — without altering the underlying DNA sequence.',
		long: "Your DNA is the hardware; epigenetics is the software. Lifestyle choices, stress, diet, and environment can add or remove chemical tags (methylation marks, histone modifications) to DNA, changing which genes are expressed. This is the mechanism by which identical twins — same DNA — can diverge dramatically in health outcomes over decades. Denis Noble's work, central to the Oxford Longevity Project report, argues that epigenetic reprogramming is both a cause of ageing and a target for intervention.",
		url: 'https://www.whatisepigenetics.com',
		urlLabel: 'What is Epigenetics? (overview)'
	},
	sedentary: {
		id: 'sedentary',
		name: 'Sedentary Behaviour',
		short:
			'Sitting or lying still for prolonged periods while awake — distinct from simply not exercising. Research now treats it as an independent risk factor for disease, even in people who meet exercise guidelines.',
		long: '<p>Sedentary behaviour is formally defined as any waking activity with an energy expenditure ≤1.5 METs (metabolic equivalents) — essentially sitting, reclining, or lying still. It is <strong>not the same as physical inactivity</strong>: someone can hit all exercise guidelines and still be dangerously sedentary if they sit for 10 hours a day.</p><ul><li><strong>The Whitehall II study</strong> (Marmot et al.) found that civil servants with the most sedentary jobs had significantly higher rates of cardiovascular disease, independent of leisure-time exercise.</li><li><strong>Biswas et al. (Annals of Internal Medicine, 2015)</strong> — a meta-analysis of 47 studies — found that prolonged sitting is associated with a 24% increased risk of all-cause mortality, 18% increased risk of cardiovascular disease mortality, and 17% increased risk of type 2 diabetes, <em>after adjusting for physical activity levels</em>.</li><li><strong>Lee et al. (Lancet, 2012)</strong> estimated that physical inactivity causes 9% of premature deaths globally — comparable to the mortality burden of smoking.</li></ul><p>The mechanism is partly metabolic: prolonged sitting suppresses lipoprotein lipase activity, reduces glucose uptake in muscles, and elevates triglycerides within hours. The body appears to need <strong>frequent low-level movement throughout the day</strong> — not just a concentrated exercise block — to maintain baseline metabolic health.</p><p>The practical upshot from Sir Muir Gray: break sitting every 20–30 minutes. Stand, walk briefly, shift position. The target is <strong>fewer than 8 hours of total sitting per day</strong>.</p>',
		url: 'https://www.acpjournals.org/doi/10.7326/M14-1651',
		urlLabel:
			'Biswas et al. — Sedentary Time and Its Association with Risk (Annals of Internal Medicine, 2015)',
		references: [
			{
				label: 'Whitehall II: physical activity, sedentary behaviour, and aortic stiffness',
				url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5586440/'
			},
			{
				label: 'Biswas et al. (2015): sedentary time and disease risk',
				url: 'https://pubmed.ncbi.nlm.nih.gov/25599350/'
			},
			{
				label: 'Lee et al. (2012): physical inactivity and global NCD burden',
				url: 'https://pubmed.ncbi.nlm.nih.gov/22818936/'
			}
		]
	},
	hyperpalatable: {
		id: 'hyperpalatable',
		name: 'Hyperpalatable Food',
		short:
			'Foods engineered to deliver simultaneous hits of fat, sugar, and salt at levels never found in nature — triggering reward circuits far beyond what any whole food can.',
		long: "<p>The term was coined by nutrition researchers to describe foods deliberately formulated to be as rewarding as possible. They combine three properties that rarely co-occur in nature:</p><ul><li><strong>Fat + sugar</strong> — e.g. ice cream, chocolate, pastries</li><li><strong>Fat + salt</strong> — e.g. chips, processed meats, fast food</li><li><strong>Fat + sugar + salt</strong> — e.g. ultra-processed snacks engineered to hit all three simultaneously</li></ul><p>These combinations hijack the brain's dopamine reward system more powerfully than any single macronutrient alone. A 2019 NIH study found that people given unrestricted access to ultra-processed foods ate on average <strong>500 extra calories per day</strong> compared to those given whole-food equivalents — even when both groups reported similar hunger and fullness levels.</p><p>Crucially, no hunter-gatherer ever encountered a chocolate-glazed doughnut. The Palaeolithic body has no evolved satiety signal strong enough to override the engineered reward. The result is chronic overconsumption without conscious intent.</p>",
		url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6538867/',
		urlLabel: 'Hall et al. (2019) — Ultra-processed diets cause excess calorie intake (NIH)'
	},
	'palaeolithic-body': {
		id: 'palaeolithic-body',
		name: 'The Palaeolithic Body',
		short:
			'The human body is a product of 2.5 million years of evolution in a hunter-gatherer environment — and has barely changed in the 10,000 years since agriculture, let alone the 200 years since industrialisation.',
		long: '<p>For roughly 99% of human evolutionary history, our ancestors were hunter-gatherers. The body that resulted was exquisitely adapted to that environment:</p><ul><li><strong>Daily long-distance walking</strong> (8–15 miles/day) and occasional sprinting from predators or after prey</li><li><strong>Varied, minimally processed food</strong> — whole plants, lean meat, fish, seasonal fruit — with regular periods of scarcity</li><li><strong>Abundant sleep</strong>, cued by natural light cycles, averaging 7–8 hours</li><li><strong>Rich social bonds</strong> in small, stable communities of 50–150 people</li><li><strong>Acute, resolvable stress</strong> — a predator, a drought — rather than the chronic low-grade stress of modern working life</li></ul><p>Daniel Lieberman\'s "mismatch hypothesis" argues that the chronic diseases now driving most premature death — heart disease, type 2 diabetes, obesity, many cancers — are not the inevitable consequences of ageing. They are <strong>evolutionary mismatches</strong>: the result of placing a body optimised for one environment into a radically different one. The body\'s fat-storage genes that protected against famine now drive obesity. The stress response that mobilised energy for physical danger now chronically elevates cortisol, inflaming arteries and suppressing immunity. The insight is both humbling and empowering: most chronic disease is not destiny.</p>',
		url: 'https://www.goodreads.com/book/show/17736859-the-story-of-the-human-body',
		urlLabel: 'Lieberman — The Story of the Human Body (2013)'
	},
	centenarians: {
		id: 'centenarians',
		name: 'Centenarians',
		short:
			'People who have reached or passed their 100th birthday. Women make up roughly 80% of them in every country that keeps records.',
		long: '<p>A centenarian is someone aged 100 or older. As of 2023, there are an estimated <strong>722,000 centenarians worldwide</strong> — a number projected to exceed 3.7 million by 2050 as earlier birth cohorts reach extreme old age.</p><p>The female dominance is striking and consistent: in the UK, US, Japan, France, and across WHO data, women account for 75–85% of all centenarians. The reasons are multi-factorial:</p><ul><li><strong>Biological resilience</strong> — women carry two X chromosomes; the redundancy provides backup copies of longevity-relevant genes and immune function genes.</li><li><strong>Hormonal protection</strong> — oestrogen has anti-inflammatory and cardiovascular-protective effects throughout reproductive life.</li><li><strong>Behavioural factors</strong> — women are more likely to seek healthcare, maintain social bonds, and adopt health-protective behaviours across the life course.</li><li><strong>Telomere biology</strong> — women tend to have longer telomeres at birth and lose them more slowly, consistent with slower cellular ageing.</li></ul><p>The paradox is that while women are biologically more likely to reach 100, they spend a higher proportion of those extra years in poor health — the "morbidity gap" — largely because the healthcare system was designed around male biology.</p>',
		url: 'https://www.who.int/news-room/fact-sheets/detail/ageing-and-health',
		urlLabel: 'WHO: Ageing and Health'
	},
	'deprivation-deciles': {
		id: 'deprivation-deciles',
		name: 'Deprivation Deciles (D1–D10)',
		short:
			'England is divided into ten equal groups — deciles — ranked from most deprived (D1) to least deprived (D10), based on the Index of Multiple Deprivation.',
		long: "<p>The <strong>Index of Multiple Deprivation (IMD)</strong> is England's official measure of relative deprivation. It ranks all 32,844 small geographic areas (Lower Super Output Areas, each covering roughly 1,500 people) from most to least deprived.</p><p>The IMD combines seven weighted domains:</p><ul><li><strong>Income</strong> (22.5%) — proportion of people in low-income households</li><li><strong>Employment</strong> (22.5%) — proportion unable to work due to unemployment, illness, or disability</li><li><strong>Education, skills & training</strong> (13.5%) — attainment, skills, and qualifications</li><li><strong>Health & disability</strong> (13.5%) — premature death, illness, disability</li><li><strong>Crime</strong> (9.3%) — rates of violence, burglary, theft, criminal damage</li><li><strong>Housing & services</strong> (9.3%) — overcrowding and access to services</li><li><strong>Living environment</strong> (9.3%) — indoor and outdoor environment quality</li></ul><p>Once ranked, areas are grouped into tenths: <strong>D1</strong> is the most deprived 10% of areas in England; <strong>D10</strong> is the least deprived 10%. The 18.5-year gap in healthy life expectancy between D1 and D10 reflects cumulative disadvantage across all seven domains — not any single factor.</p>",
		url: 'https://www.gov.uk/government/statistics/english-indices-of-deprivation-2019',
		urlLabel: 'English Indices of Deprivation 2019 — GOV.UK'
	},
	'mismatch-disease': {
		id: 'mismatch-disease',
		name: 'Mismatch Disease',
		short:
			'A chronic illness caused by the conflict between the environment our bodies evolved for and the environment we actually live in.',
		long: 'Coined by Daniel Lieberman in The Story of the Human Body (2013), mismatch diseases include type 2 diabetes, obesity, cardiovascular disease, myopia, flat feet, and lower back pain. They arise because Palaeolithic adaptations — fat storage, a preference for calorie-dense food, rest after exertion — are actively harmful in an environment of perpetual calorie surplus and enforced sedentariness. Lieberman argues they are not inevitable consequences of ageing, but consequences of a mismatched environment.',
		url: 'https://www.goodreads.com/book/show/17736859-the-story-of-the-human-body',
		urlLabel: 'Lieberman — The Story of the Human Body'
	}
};

export function getTerm(id: string): Term | undefined {
	return terms[id];
}
