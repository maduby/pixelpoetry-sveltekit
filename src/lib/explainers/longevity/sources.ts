import type { Source } from '$lib/types/explainer';

export type { Source };

export const sources: Record<string, Source> = {
	'olp-2026': {
		id: 'olp-2026',
		short: 'OLP report',
		full: "Ball, C., Gray, M., Ch'en, P., Kenny, L. & Noble, D. (2026). Living Longer, Better: The Age-less Report. Oxford Longevity Project.",
		url: '/explainers/longevity/sources/living-longer-better-olp-report.pdf',
		year: 2026,
		references: [
			{
				citation:
					'The report synthesises evidence across five domains — sleep, mindset, exercise, diet, and stress (S-MEDs) — drawing on peer-reviewed literature in geroscience, epidemiology, and clinical medicine to argue that at least 80% of the determinants of healthy ageing are modifiable.'
			},
			{
				citation:
					'Website: Oxford Longevity Project — background on the organisation and its longevity work.',
				url: 'https://oxfordlongevityproject.org/'
			},
			{
				citation:
					'Programme link: Live Longer Better — the OLP-linked plan referenced in the report.',
				url: 'https://oxfordlongevityproject.org/live-longer-better'
			},
			{
				citation:
					"Noble, D. (2023). Understanding Living Systems. Cambridge University Press. — The epigenetics chapter underpins the report's argument that lifestyle choices reshape gene expression across the life course.",
				url: 'https://www.cambridge.org/core/books/understanding-living-systems/8D7C1CE43FD9DDED0ECAE8A0FF5E60B4'
			}
		]
	},
	'guardian-hill-2026': {
		id: 'guardian-hill-2026',
		short: 'Guardian / Hill (2026)',
		full: 'Hill, A. (2026, May 20). "At least 80% responsibility for ill health in old age down to individual, study says." The Guardian.',
		url: 'https://www.theguardian.com/society/2026/may/20/responsibility-ill-health-old-age-oxford-longevity-project-study',
		year: 2026,
		references: [
			{
				citation:
					'Reports the Oxford Longevity Project claim that at least 80% of ill health in old age is attributable to individual responsibility, while noting critics who argue the framing underplays poverty, pollution, food environments, work, healthcare access, and policy choices.'
			},
			{
				citation:
					'Includes responses from Nancy Krieger, Steven Woolf, Devi Sridhar, and Jay Olshansky; also quotes Sir Christopher Ball defending the report as a hopeful call to action rather than a denial of structural constraints.'
			},
			{
				citation:
					'The article notes that the report was launched at the Smart Ageing Summit in Oxford and that its recommendations include avoiding processed foods, abstaining from alcohol, prioritising sleep, not eating late, and adopting what it calls a "not-meat mindset".'
			}
		]
	},
	'landmark-twins-1996': {
		id: 'landmark-twins-1996',
		short: 'Herskind et al. (1996)',
		full: 'Herskind, A. M. et al. (1996). The heritability of human longevity: a population-based study of 2872 Danish twin pairs born 1870–1900. Human Genetics, 97(3), 319–323.',
		url: 'https://pubmed.ncbi.nlm.nih.gov/8786073/',
		year: 1996,
		references: [
			{
				citation:
					'McGue, M. & Christensen, K. (2001). The heritability of level and rate-of-change in cognitive functioning in Danish twins aged 70 years and older. Experimental Aging Research, 27(4), 369–380. — Consistent with Herskind: genetics account for roughly 25% of variance in lifespan; the bulk is lifestyle and environment.',
				url: 'https://pubmed.ncbi.nlm.nih.gov/11700721/'
			},
			{
				citation:
					'Ruby, J. G. et al. (2018). Estimates of the Heritability of Human Longevity Are Substantially Inflated Due to Assortative Mating. Genetics, 210(3), 1109–1124. — A reanalysis of Ancestry data on 54 million people found the heritability of lifespan may be even lower than previously thought (closer to 7%).',
				url: 'https://doi.org/10.1534/genetics.118.301613'
			}
		]
	},
	'uk-biobank-2022': {
		id: 'uk-biobank-2022',
		short: 'Yarmolinsky et al. / UK Biobank (2022)',
		full: 'Yarmolinsky, J. et al. (2022). Association of modifiable risk factors in young adulthood with future risk of common diseases: multivariate Mendelian randomisation study using UK Biobank. The BMJ, 379, e071225.',
		url: 'https://doi.org/10.1136/bmj-2022-071225',
		year: 2022,
		references: [
			{
				citation:
					'The UK Biobank recruited ~500,000 participants aged 40–69. Oxford Population Health analyses consistently show that lifestyle factors (smoking, activity, diet, BMI, blood pressure, cholesterol) predict the majority of chronic disease risk — independent of genetic background.'
			}
		]
	},
	'lieberman-2013': {
		id: 'lieberman-2013',
		short: 'Lieberman (2013)',
		full: 'Lieberman, D. (2013). The Story of the Human Body: Evolution, Health, and Disease. Pantheon Books.',
		url: 'https://www.goodreads.com/book/show/17736859-the-story-of-the-human-body',
		year: 2013,
		references: [
			{
				citation:
					'Lieberman argues that most chronic diseases — heart disease, type 2 diabetes, obesity, back pain, flat feet — are "mismatch diseases": conditions caused by living in environments our Palaeolithic bodies were never designed for. The fix is to change the environment, not just the individual.'
			}
		]
	},
	'noble-2023': {
		id: 'noble-2023',
		short: 'Noble (2023)',
		full: 'Noble, D. (2023). Understanding Living Systems. Cambridge University Press.',
		url: 'https://www.cambridge.org/core/books/understanding-living-systems/8D7C1CE43FD9DDED0ECAE8A0FF5E60B4',
		year: 2023
	},
	'scott-ellison-2021': {
		id: 'scott-ellison-2021',
		short: 'Scott & Ellison (2021)',
		full: 'Scott, A. J. & Ellison, M. (2021). The Economic Value of Targeting Ageing. Nature Aging, 1, 616–623.',
		url: 'https://www.nature.com/articles/s43587-021-00080-0',
		year: 2021,
		references: [
			{
				citation:
					'Using longevity dividend modelling, Scott and Ellison estimate that slowing the rate of ageing sufficiently to add one year of healthy life across the US population would be worth approximately $37 trillion in economic value — exceeding the combined value of eliminating cancer and cardiovascular disease.'
			}
		]
	},
	'ons-hle-2020': {
		id: 'ons-hle-2020',
		short: 'ONS Healthy Life Expectancy (2022)',
		full: 'Office for National Statistics (2022). Health state life expectancies, UK: 2018 to 2020. Statistical Bulletin.',
		url: 'https://www.ons.gov.uk/peoplepopulationandcommunity/healthandsocialcare/healthandlifeexpectancies/bulletins/healthstatelifeexpectanciesuk/2018to2020',
		year: 2022,
		references: [
			{
				citation:
					'UK males at birth: life expectancy 79.4 years, healthy life expectancy 63.1 years — meaning ~16 years in poor health. UK females at birth: life expectancy 83.1 years, healthy life expectancy 63.9 years — meaning ~19 years in poor health.'
			},
			{
				citation:
					'Public Health England (2017). Health Profile for England: Chapter 5 — inequalities in health. — The 18.5-year gap in healthy life expectancy between the most and least deprived deciles in England.'
			}
		]
	},
	'buettner-2023': {
		id: 'buettner-2023',
		short: 'Buettner & National Geographic (2023)',
		full: "Buettner, D. & Skemp, S. (2016). Blue Zones: Lessons From the World's Longest Lived. American Journal of Lifestyle Medicine, 10(5), 318–321. Updated reporting: National Geographic, 2023.",
		url: 'https://doi.org/10.1177/1559827616637066',
		year: 2023,
		references: [
			{
				citation:
					"Blue Zones (2012). Okinawa's Longevity Lessons. bluezones.com — Ikigai, plant-based diet, moai social networks, daily gardening, and low-furniture floor living: the nine longevity practices observed in Okinawan centenarians.",
				url: 'https://www.bluezones.com/2012/02/okinawas-longevity-lessons-2/'
			},
			{
				citation:
					'Newman, S. J. (2023). Supercentenarian and remarkable age records exhibit patterns indicative of clerical errors and pension fraud. PLOS ONE. — Challenges the accuracy of some Blue Zone longevity records, particularly in Sardinia and Okinawa, citing probable record-keeping errors.'
			}
		]
	},
	'who-gbd-2022': {
		id: 'who-gbd-2022',
		short: 'WHO Global Burden of Disease (2022)',
		full: 'World Health Organization / Institute for Health Metrics and Evaluation (2022). Global Burden of Disease Study 2022.',
		url: 'https://www.healthdata.org/research-analysis/gbd',
		year: 2022,
		references: [
			{
				citation:
					'Non-communicable diseases (heart disease, stroke, cancer, chronic respiratory diseases, diabetes) now account for 74% of all deaths globally — up from ~60% in 2000. In high-income countries the share exceeds 90%.'
			}
		]
	},
	'walker-2017': {
		id: 'walker-2017',
		short: 'Walker (2017)',
		full: 'Walker, M. (2017). Why We Sleep: Unlocking the Power of Sleep and Dreams. Scribner.',
		url: 'https://www.goodreads.com/book/show/34466963-why-we-sleep',
		year: 2017,
		references: [
			{
				citation:
					'Cappuccio, F. P. et al. (2010). Sleep duration and all-cause mortality: a systematic review and meta-analysis of prospective studies. Sleep, 33(5), 585–592. — Sleeping fewer than 6 hours per night is associated with a 12% higher all-cause mortality risk.',
				url: 'https://doi.org/10.1093/sleep/33.5.585'
			},
			{
				citation:
					'CDC National Health Interview Survey (2020): 35% of US adults routinely sleep fewer than 7 hours per night.'
			}
		]
	},
	'unsplash-healthy-habit': {
		id: 'unsplash-healthy-habit',
		short: 'Dua Gianna / Unsplash',
		full: 'Dua Gianna. "2 black and gray dumbbells on green grass." Unsplash. Published August 13, 2021.',
		url: 'https://unsplash.com/photos/2-black-and-gray-dumbbells-on-green-grass-IzdLRdXcNT8',
		year: 2021,
		references: [
			{
				citation: 'Free to use under the Unsplash License.'
			}
		]
	},
	'unsplash-lifestyle-pattern': {
		id: 'unsplash-lifestyle-pattern',
		short: 'Unsplash lifestyle-pattern photo',
		full: 'Unsplash. "Woman in yellow and white floral button-up shirt holding yellow banana."',
		url: 'https://unsplash.com/photos/woman-in-yellow-and-white-floral-button-up-shirt-holding-yellow-banana-E9BR0lNMiQE',
		year: 2026,
		references: [
			{
				citation:
					'Used as an editorial illustration of lifestyle patterns: whole foods, ordinary routines, and everyday health behaviour.'
			}
		]
	},
	'riseyoga-marc-duby-photo': {
		id: 'riseyoga-marc-duby-photo',
		short: 'Rise Yoga / Marc Duby',
		full: 'Rise Yoga. Yoga, movement, and staying active. Photograph by Marc Duby.',
		url: 'https://riseyoga.co.za',
		year: 2026,
		references: [
			{
				citation: 'Photo credit: riseyoga.co.za — Photo by Marc Duby.'
			}
		]
	},
	'balance-composite': {
		id: 'balance-composite',
		short: 'Balance composite image',
		full: 'Composite image by Marc Duby using source images from Unsplash. The image contrasts systemic constraints with personal decisions and everyday opportunities to stay active.',
		year: 2026,
		references: [
			{
				citation: 'Nonsap Visuals / Unsplash. Woman walks past a blue door on brick building.',
				url: 'https://unsplash.com/photos/woman-walks-past-a-blue-door-on-brick-building-GY7TYlaF0jw'
			},
			{
				citation:
					'Getty Images / Unsplash. Rear view of two young interracial male workers in uniform discussing quality of new equipment while moving along aisle in warehouse.',
				url: 'https://unsplash.com/photos/rear-view-of-two-young-interracial-male-workers-in-uniform-discussing-quality-of-new-equipment-while-moving-along-aisle-in-warehouse-75N_hp1EjEo'
			},
			{
				citation: 'Composite by Marc Duby.'
			}
		]
	},
	'gray-bmj-2019': {
		id: 'gray-bmj-2019',
		short: 'Muir Gray (BMJ, 2019)',
		full: 'Gray, M. (2019). The Fitness Gap: How inactivity ages us faster than time. BMJ editorial and supporting evidence.',
		url: 'https://www.bmj.com',
		year: 2019,
		references: [
			{
				citation:
					'Lee, I. M. et al. (2012). Effect of physical inactivity on major non-communicable diseases worldwide: an analysis of burden of disease and life expectancy. The Lancet, 380(9838), 219–229. — Physical inactivity is the 4th leading risk factor for global mortality, responsible for 6% of coronary heart disease, 7% of type 2 diabetes, and 10% of breast and colon cancers.',
				url: 'https://doi.org/10.1016/S0140-6736(12)61031-9'
			}
		]
	},
	'levy-2002': {
		id: 'levy-2002',
		short: 'Levy et al. / JPERS (2002)',
		full: 'Levy, B. R., Slade, M. D., Kunkel, S. R., & Kasl, S. V. (2002). Longevity increased by positive self-perceptions of aging. Journal of Personality and Social Psychology, 83(2), 261–270.',
		url: 'https://doi.org/10.1037/0022-3514.83.2.261',
		year: 2002,
		references: [
			{
				citation:
					'In the Ohio Longitudinal Study of Aging and Retirement (n=660, 23-year follow-up), participants with more positive self-perceptions of ageing lived 7.5 years longer than those with negative views — an effect greater than the survival advantage from not smoking (5.5 years) measured within the same cohort, after controlling for age, gender, socioeconomic status, loneliness, and functional health.'
			}
		]
	},
	'matthew-pnas-2021': {
		id: 'matthew-pnas-2021',
		short: 'Li et al. / PNAS (2021)',
		full: 'Li, Y. et al. (2021). Healthy lifestyle and life expectancy free of cancer, cardiovascular disease, and type 2 diabetes: prospective cohort study. PNAS.',
		url: 'https://www.pnas.org/doi/10.1073/pnas.2106888118',
		year: 2021,
		references: [
			{
				citation:
					'Among 111,966 US nurses and health professionals followed for 20+ years, adopting all five healthy lifestyle factors (not smoking, healthy BMI, physical activity ≥30 min/day, moderate alcohol, high-quality diet) was associated with living 7.5 years longer for women and 5 years longer for men — free of chronic disease.'
			}
		]
	}
};

export function getSource(id: string): Source | undefined {
	return sources[id];
}
