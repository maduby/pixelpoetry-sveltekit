import type { Source } from '$lib/types/explainer';

export type { Source };

export const sources: Record<string, Source> = {
	'van-tulleken-2023': {
		id: 'van-tulleken-2023',
		short: 'Van Tulleken (2023)',
		full: 'Van Tulleken, C. (2023). Ultra-Processed People: The Science Behind Food That Isn’t Food. Cornerstone Press.',
		url: 'https://www.goodreads.com/book/show/74843812-ultra-processed-people',
		year: 2023,
		references: [
			{
				citation: 'Hall, K. D. et al. (2019). Ultra-Processed Diets Cause Excess Calorie Intake and Weight Gain: An Inpatient Randomized Controlled Trial. Cell Metabolism, 30(1), 67–77. — The NIH study that first demonstrated causal weight gain from UPF in a controlled setting.',
				url: 'https://doi.org/10.1016/j.cmet.2019.05.008'
			},
			{
				citation: 'Monteiro, C. A. et al. (2017). The NOVA food classification and the trouble with ultra-processing. Public Health Nutrition, 21(1), 5–17. — Defines the NOVA classification system used throughout the book.',
				url: 'https://pubmed.ncbi.nlm.nih.gov/28322183/'
			},
			{
				citation: 'Lane, M. M. et al. (2024). Ultra-processed food exposure and adverse health outcomes: umbrella review. BMJ, 384, e077310. — Synthesises 45 meta-analyses linking UPF to 32 health outcomes.',
				url: 'https://www.bmj.com/content/384/bmj-2023-077310'
			},
			{
				citation: 'Fiolet, T. et al. (2018). Consumption of ultra-processed foods and cancer risk: NutriNet-Santé cohort. BMJ, 360, k322. — 104,980 adults; 10% increase in UPF linked to >10% increase in overall cancer risk.',
				url: 'https://doi.org/10.1136/bmj.k322'
			},
			{
				citation: 'Schulte, E. M. et al. (2015). Which Foods May Be Addictive? The Roles of Processing, Fat Content, and Glycaemic Load. PLOS ONE. — Ultra-processed foods most strongly linked to addictive eating behaviours.',
				url: 'https://doi.org/10.1371/journal.pone.0117959'
			},
			{
				citation: 'Srour, B. et al. (2019). Ultra-processed food intake and risk of cardiovascular disease: prospective cohort study. BMJ, 365, l1451. — Each 10% increase in UPF linked to >10% rise in cardiovascular disease risk.',
				url: 'https://doi.org/10.1136/bmj.l1451'
			}
		]
	},
	'bmj-2024': {
		id: 'bmj-2024',
		short: 'BMJ umbrella review (2024)',
		full: 'Lane, M. M. et al. (2024). Ultra-processed food exposure and adverse health outcomes: umbrella review. BMJ, 384, e077310.',
		url: 'https://www.bmj.com/content/384/bmj-2023-077310',
		year: 2024
	},
	'monteiro-2017': {
		id: 'monteiro-2017',
		short: 'Monteiro et al. (2017)',
		full: 'Monteiro, C. A. et al. (2017). The UN Decade of Nutrition, the NOVA food classification and the trouble with ultra-processing. Public Health Nutrition.',
		url: 'https://pubmed.ncbi.nlm.nih.gov/28322183/',
		year: 2017
	},
	'lancet-upf-series-2025': {
		id: 'lancet-upf-series-2025',
		short: 'The Lancet UPF Series (2025)',
		full: 'The Lancet (2025). Series: Policies to halt and reverse the rise in ultra-processed food.',
		url: 'https://www.thelancet.com/series/ultra-processed-food',
		year: 2025
	},
	'nature-medicine-2025': {
		id: 'nature-medicine-2025',
		short: 'Nature Medicine (2025)',
		full: 'Schulte, E. M. et al. (2025). Ultra-processed foods trigger addictive behaviors. Nature Medicine.',
		url: 'https://www.nature.com/nm/',
		year: 2025
	},
	'iarc-who-2023': {
		id: 'iarc-who-2023',
		short: 'IARC / WHO (2023)',
		full: 'International Agency for Research on Cancer / WHO (2023). Multinational study linking UPF to cancer and cardiometabolic multimorbidity.',
		url: 'https://www.iarc.who.int/',
		year: 2023
	},
	'nat-food-2025': {
		id: 'nat-food-2025',
		short: 'Northcott et al., Nature Food (2025)',
		full: 'Northcott, T. et al. (2025). Regulatory responses to ultra-processed foods are skewed. Nature Food, 6(3), 273–282.',
		url: 'https://www.nature.com/articles/s43016-025-01131-4',
		year: 2025
	},
	'gfw-2022': {
		id: 'gfw-2022',
		short: 'Global Forest Watch (2022)',
		full: 'Global Forest Watch (2022). Drivers of global tropical deforestation. World Resources Institute.',
		url: 'https://www.globalforestwatch.org',
		year: 2022
	},
	'our-world-in-data-food-co2': {
		id: 'our-world-in-data-food-co2',
		short: 'Our World in Data — Food emissions (2023)',
		full: 'Ritchie, H. & Roser, M. (2023). Environmental impacts of food production. Our World in Data.',
		url: 'https://ourworldindata.org/environmental-impacts-of-food',
		year: 2023
	},
	'who-addiction-2024': {
		id: 'who-addiction-2024',
		short: 'WHO global substance use estimates (2024)',
		full: 'World Health Organization (2024). Global status report on alcohol and health and treatment of substance use disorders.',
		url: 'https://www.who.int/publications/i/item/9789240096745',
		year: 2024
	},
	'body-coach-upf-guide': {
		id: 'body-coach-upf-guide',
		short: 'The Body Coach',
		full: 'The Body Coach (2025). Ultra-processed food: A beginner\'s guide. Featuring Dr Chris van Tulleken.',
		url: 'https://www.thebodycoach.com/blog/ultra-processed-food-a-beginners-guide/',
		year: 2025
	},
	'bhf-upf-health': {
		id: 'bhf-upf-health',
		short: 'British Heart Foundation (2025)',
		full: 'Taylor, V. (2025). Ultra-processed foods: how bad are they for your health? British Heart Foundation, Heart Matters magazine.',
		url: 'https://www.bhf.org.uk/informationsupport/heart-matters-magazine/news/behind-the-headlines/ultra-processed-foods',
		year: 2025
	},
	'daily-record-upf-good': {
		id: 'daily-record-upf-good',
		short: 'Daily Record (2023)',
		full: 'Kirby, J. & Farrell, L. (2023). The \'ultra-processed foods\' that are good for health, according to new study. Daily Record — reporting on IARC / WHO research published in The Lancet Regional Health.',
		url: 'https://www.dailyrecord.co.uk/lifestyle/ultra-processed-foods-good-health-31434590',
		year: 2023
	},
	'hsrc-nfnss-2024': {
		id: 'hsrc-nfnss-2024',
		short: 'HSRC NFNSS (2024)',
		full: 'Human Sciences Research Council (2024). National Food and Nutrition Security Survey — South Africa. Commissioned by the Department of Agriculture, Land Reform and Rural Development. Reported by Simelane, T. (HSRC, March 2024); see also Simelane et al., National Food and Nutrition Security Survey (ResearchGate, 2024).',
		url: 'https://hsrc.ac.za/news/research-outputs/almost-50-of-adult-south-africans-are-overweight-or-obese-poverty-and-poor-nutrition-are-largely-to-blame/',
		year: 2024
	},
	'kelloggs-coco-pops-sa': {
		id: 'kelloggs-coco-pops-sa',
		short: 'Kellogg\'s SA — Coco Pops product page',
		full: 'Kellogg\'s South Africa — Coco Pops Chocolate Flavour Multigrain Cereals. Product page and pack imagery, kelloggs.com.',
		url: 'https://www.kelloggs.com',
		year: 2024
	},
	'marino-2021-nutrients': {
		id: 'marino-2021-nutrients',
		short: 'Marino et al., Nutrients (2021)',
		full: 'Marino M, Puppo F, Del Bo\' C, Vinelli V, Riso P, Porrini M, Martini D. A Systematic Review of Worldwide Consumption of Ultra-Processed Foods: Findings and Criticisms. Nutrients. 2021;13(8):2778. doi:10.3390/nu13082778. Pooled 99 studies covering 1,378,454 participants across 21 countries.',
		url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8398521/',
		year: 2021
	},
	'superloaf-listings-2024': {
		id: 'superloaf-listings-2024',
		short: 'Inside Food & Drink (2024)',
		full: '"Healthy-UPF" Superloaf Seals Listings in Sainsbury\'s and Morrisons. Inside Food & Drink. Modern Baker / Hovis press coverage of Superloaf — the bread marketed as "the world\'s first healthy UPF" — illustrating that products meeting the NOVA-4 ultra-processed definition are now actively positioned as health products.',
		url: 'https://insidefoodanddrink.com/healthy-upf-superloaf-seals-listings-in-sainsburys-and-morrisons/',
		year: 2024
	}
};

export function getSource(id: string): Source | undefined {
	return sources[id];
}
