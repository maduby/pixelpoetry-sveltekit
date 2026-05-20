/**
 * Inline term definitions — shown in the bottom sheet when a [data-term] link
 * is clicked in the story text. Entries are keyed by the `data-term` attribute
 * value used in richText HTML strings.
 *
 * Rules:
 *   - `short` is a single-sentence plain-language definition.
 *   - `long` is 2–3 sentences of context.
 *   - Only link a term once across the whole piece.
 */

import type { Term } from '$lib/types/explainer';

export type { Term };

export const terms: Record<string, Term> = {
	nova: {
		id: 'nova',
		name: 'The NOVA Classification',
		short: 'A scientific framework that sorts all food into four groups by how — and why — it was processed.',
		long: 'Developed at the University of São Paulo in 2009 by Prof. Carlos Monteiro and colleagues, NOVA does not assess nutrients — it assesses the nature, extent, and purpose of processing. Group 1 is unprocessed; Group 4 is ultra-processed. NOVA is now the standard framework used in public health nutrition research worldwide.',
		url: 'https://www.fao.org/nutrition/education/food-based-dietary-guidelines/background/guides-classification-food-processing/en/',
		urlLabel: 'FAO overview of NOVA'
	},
	gras: {
		id: 'gras',
		name: 'GRAS — Generally Recognised As Safe',
		short: 'A US regulatory loophole that allows food companies to self-certify new additives as safe — without independent FDA review.',
		long: 'Established by the 1958 Food Additives Amendment, GRAS was intended for well-known ingredients like salt and vinegar. Over time it became the primary route for thousands of novel industrial additives. Companies are not required to notify the FDA of a GRAS determination, meaning regulators often have no record of what is entering the food supply. Van Tulleken compares this to the tobacco industry\'s historic ability to self-regulate.',
		url: 'https://www.fda.gov/food/food-ingredients-packaging/generally-recognized-safe-gras',
		urlLabel: 'FDA GRAS overview'
	},
	'bliss-point': {
		id: 'bliss-point',
		name: 'The Bliss Point',
		short: 'The precise combination of fat, sugar, salt and texture engineered to maximise palatability and override the body\'s natural fullness signals.',
		long: 'The term was coined by food scientist Howard Moskowitz, who developed optimisation methods used by major food companies. When a food hits its bliss point, the brain\'s dopamine reward system fires strongly — similar in pattern to substance use. Van Tulleken argues the bliss point is not a side effect of food engineering but its explicit goal.',
		url: 'https://www.newyorker.com/magazine/2013/05/20/the-taste-makers',
		urlLabel: 'The New Yorker — The Taste Makers'
	},
	'double-burden': {
		id: 'double-burden',
		name: 'The Double Burden of Malnutrition',
		short: 'When hunger and overweight coexist in the same population — often inside the same households — driven by cheap, calorie-dense but nutrient-poor diets.',
		long: 'First formalised by the WHO and central to the HSRC\'s 2024 National Food and Nutrition Security Survey of South Africa, the double burden combines undernutrition, micronutrient deficiency ("hidden hunger"), and overweight or obesity. Families relying on social grants tend to buy energy-rich, ultra-processed foods to keep hunger at bay — gaining weight while remaining malnourished. The HSRC survey found that almost 50% of adult South Africans are overweight or obese, even as 63.5% of households are food-insecure.',
		url: 'https://hsrc.ac.za/news/research-outputs/almost-50-of-adult-south-africans-are-overweight-or-obese-poverty-and-poor-nutrition-are-largely-to-blame/',
		urlLabel: 'HSRC — almost 50% of adult South Africans are overweight or obese'
	}
};

export function getTerm(id: string): Term | undefined {
	return terms[id];
}
