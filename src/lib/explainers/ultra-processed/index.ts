/**
 * Barrel module for the Ultra-Processed explainer.
 *
 * Imported by `src/routes/ultra-processed/explainer/+page.svelte` and
 * passed into `setActiveExplainer(...)` so shared components (Nav,
 * ProgressBar, viz, SourceSheet, EssayFooter) can read the right data.
 */
import type { ActiveExplainer } from '$lib/context/explainer.svelte';
import { meta } from './meta';
import { chapters } from './chapters';
import { sources, getSource } from './sources';
import { terms, getTerm } from './terms';
import { imageManifest } from './image-manifest';
import type { ImageEntry } from '$lib/types/explainer';

function getImage(name: string): ImageEntry | undefined {
	return imageManifest.find((e) => e.name === name);
}

export const ultraProcessed: ActiveExplainer = {
	meta,
	chapters,
	sources,
	terms,
	imageManifest,
	getSource,
	getTerm,
	getImage
};

export { meta, chapters, sources, terms, imageManifest, getSource, getTerm, getImage };
