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
		short: 'The number of years you live in good health — free from serious illness, disability, or cognitive decline.',
		long: 'Healthspan is distinct from lifespan. The UK average woman currently lives to 83 but has a healthspan of roughly 64 — meaning almost two decades of her life are spent in poor health. The goal of longevity science is not simply to add years to life, but to add life to years: compressing the period of decline into as short a window as possible before death.',
		url: 'https://www.ons.gov.uk/peoplepopulationandcommunity/healthandsocialcare/healthandlifeexpectancies',
		urlLabel: 'ONS: Health state life expectancies'
	},
	exposome: {
		id: 'exposome',
		name: 'The Exposome',
		short: 'Everything your body is exposed to across a lifetime — air, food, stress, movement, relationships — and how that shapes your biology.',
		long: 'Coined by epidemiologist Christopher Wild in 2005, the exposome is the environmental counterpart to the genome. It captures all non-genetic exposures from conception to death. Longevity researchers argue that the exposome explains far more variance in lifespan and healthspan than genetic inheritance — the Landmark Twins Study suggests genetics account for only ~25% of longevity; the rest is exposome.',
		url: 'https://www.niehs.nih.gov/research/supported/exposure/exposome',
		urlLabel: 'NIH: The Exposome and Health'
	},
	'fitness-gap': {
		id: 'fitness-gap',
		name: 'The Fitness Gap',
		short: 'The widening space between how fast we could decline physically with age, and how fast most of us actually do.',
		long: 'Coined by Sir Muir Gray, the fitness gap describes the difference between the best-possible rate of age-related physical decline (roughly 0.5% per year after peak fitness at ~30) and the actual rate most sedentary adults experience (roughly 1.5–2% per year). Gray argues that the majority of what we attribute to "ageing" is actually disuse — and that it is largely reversible at any age with appropriate exercise.',
		url: 'https://www.bmj.com',
		urlLabel: 'BMJ: Physical activity and healthy ageing'
	},
	smeds: {
		id: 'smeds',
		name: 'S-MEDs',
		short: 'The Oxford Longevity Project framework: Sleep, Mindset, Exercise, Diet, and Stress — the five domains where evidence is strongest for extending healthspan.',
		long: 'S-MEDs was developed by the Oxford Longevity Project to organise the evidence-based levers for healthy ageing. It stands for Sleep (the foundational pillar), Mindset (including ageism as a self-fulfilling prophecy), Exercise (the single most powerful intervention), Diet (minimally processed, protein-sufficient after 50), and Stress (chronic psychological stress accelerates cellular ageing via cortisol and telomere shortening). The lowercase "s" for Stress reflects that, while important, it operates partly via its effects on the other four.'
	},
	'blue-zones': {
		id: 'blue-zones',
		name: 'Blue Zones',
		short: 'Five geographic regions where people consistently live significantly longer, healthier lives than the global average.',
		long: 'Identified by Dan Buettner and colleagues at National Geographic, the five original Blue Zones are: Barbagia, Sardinia (Italy); Okinawa (Japan); Nicoya Peninsula (Costa Rica); Loma Linda, California (USA); and Ikaria (Greece). All five share common patterns: a largely plant-based diet, daily moderate movement baked into the environment, strong social and community ties, a sense of purpose, and low chronic stress. Some researchers have challenged specific centenarian counts (particularly in Sardinia), but the underlying lifestyle patterns are corroborated by independent research.',
		url: 'https://doi.org/10.1177/1559827616637066',
		urlLabel: 'Buettner & Skemp (2016) — American Journal of Lifestyle Medicine'
	},
	'hallmarks-of-ageing': {
		id: 'hallmarks-of-ageing',
		name: 'The Hallmarks of Ageing',
		short: 'The nine fundamental biological processes that drive cellular deterioration over time — from DNA damage to chronic inflammation.',
		long: 'First published by López-Otín et al. in Cell (2013) and updated in 2023, the Hallmarks of Ageing are: genomic instability, telomere attrition, epigenetic alterations, loss of proteostasis, deregulated nutrient sensing, mitochondrial dysfunction, cellular senescence, stem cell exhaustion, and altered intercellular communication. Lifestyle factors (exercise, diet, sleep) have been shown to positively modulate all nine hallmarks — suggesting that while ageing is inevitable, its pace is not fixed.',
		url: 'https://doi.org/10.1016/j.cell.2022.11.001',
		urlLabel: 'López-Otín et al. (2023) — Cell'
	},
	telomeres: {
		id: 'telomeres',
		name: 'Telomeres',
		short: 'Protective caps on the ends of chromosomes that shorten every time a cell divides — a biological clock for cellular ageing.',
		long: 'Like the plastic tips on shoelaces, telomeres protect chromosomes from fraying during cell division. Each division shortens them slightly. When they become critically short, the cell stops dividing or self-destructs (apoptosis). Telomere length is a proxy measure of cellular ageing: chronic stress, smoking, obesity, and poor sleep accelerate shortening; regular aerobic exercise, adequate sleep, and stress management slow it. Nobel laureate Elizabeth Blackburn\'s work on telomeres and telomerase won the 2009 Nobel Prize in Physiology.',
		url: 'https://www.nobelprize.org/prizes/medicine/2009/press-release/',
		urlLabel: 'Nobel Prize in Physiology 2009'
	},
	epigenetics: {
		id: 'epigenetics',
		name: 'Epigenetics',
		short: 'Changes in how genes are expressed — which genes get switched on or off — without altering the underlying DNA sequence.',
		long: 'Your DNA is the hardware; epigenetics is the software. Lifestyle choices, stress, diet, and environment can add or remove chemical tags (methylation marks, histone modifications) to DNA, changing which genes are expressed. This is the mechanism by which identical twins — same DNA — can diverge dramatically in health outcomes over decades. Denis Noble\'s work, central to the Oxford Longevity Project report, argues that epigenetic reprogramming is both a cause of ageing and a target for intervention.',
		url: 'https://www.whatisepigenetics.com',
		urlLabel: 'What is Epigenetics? (overview)'
	},
	'mismatch-disease': {
		id: 'mismatch-disease',
		name: 'Mismatch Disease',
		short: 'A chronic illness caused by the conflict between the environment our bodies evolved for and the environment we actually live in.',
		long: 'Coined by Daniel Lieberman in The Story of the Human Body (2013), mismatch diseases include type 2 diabetes, obesity, cardiovascular disease, myopia, flat feet, and lower back pain. They arise because Palaeolithic adaptations — fat storage, a preference for calorie-dense food, rest after exertion — are actively harmful in an environment of perpetual calorie surplus and enforced sedentariness. Lieberman argues they are not inevitable consequences of ageing, but consequences of a mismatched environment.',
		url: 'https://www.goodreads.com/book/show/17736859-the-story-of-the-human-body',
		urlLabel: 'Lieberman — The Story of the Human Body'
	}
};

export function getTerm(id: string): Term | undefined {
	return terms[id];
}
