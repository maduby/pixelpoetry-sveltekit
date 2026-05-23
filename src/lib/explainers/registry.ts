import type { Chapter, Source } from '$lib/types/explainer';
import { chapters as longevityChapters } from './longevity/chapters';
import { meta as longevityMeta } from './longevity/meta';
import { sources as longevitySources } from './longevity/sources';
import { chapters as ultraProcessedChapters } from './ultra-processed/chapters';
import { meta as ultraProcessedMeta } from './ultra-processed/meta';
import { sources as ultraProcessedSources } from './ultra-processed/sources';

export interface ExplainerKnowledgeEntry {
	slug: string;
	name: string;
	href: string;
	sources: Record<string, Source>;
	chapters: Chapter[];
}

export const EXPLAINERS_FOR_KNOWLEDGE: ExplainerKnowledgeEntry[] = [
	{
		slug: longevityMeta.slug,
		name: longevityMeta.name,
		href: longevityMeta.href,
		sources: longevitySources,
		chapters: longevityChapters
	},
	{
		slug: ultraProcessedMeta.slug,
		name: ultraProcessedMeta.name,
		href: ultraProcessedMeta.href,
		sources: ultraProcessedSources,
		chapters: ultraProcessedChapters
	}
];
