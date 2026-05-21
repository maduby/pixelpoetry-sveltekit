/**
 * Active-explainer Svelte context.
 *
 * The site has two kinds of routes:
 *  - The landing page and other static pages → no active explainer (`null`).
 *  - An explainer route under `/explainers/<slug>` → exposes its meta,
 *    chapters, sources, terms and image manifest via this context so the
 *    shared Nav, ProgressBar, viz components and SourceSheet pick up the
 *    right data without static imports.
 *
 * Wiring:
 *   - `+layout.svelte` calls `provideExplainerHolder()` once.
 *   - `+layout.svelte` resolves the active explainer from the current path
 *     so layout-level components have the right story on direct loads.
 *   - Layout-level consumer components capture the holder during init and
 *     derive from `holder.current`, which is reactive because `current` is
 *     `$state`.
 */
import { getContext, setContext } from 'svelte';
import type { Chapter, ImageEntry, Source, Term } from '$lib/types/explainer';

export interface KeyTakeaway {
	text: string;
	href?: `#${string}`;
	linkLabel?: string;
}

export interface ExplainerMetaLike {
	slug: string;
	/** Canonical URL of this specific piece, e.g. /ultra-processed/explainer */
	href: string;
	/** Root topic URL, e.g. /ultra-processed */
	topicHref?: string;
	name: string;
	shortName: string;
	emoji?: string;
	eyebrow: string;
	tagline: string;
	description: string;
	longDescription?: string;
	ogImage?: string;
	accent: 'red' | 'amber' | 'pink' | 'ink' | 'forest' | 'blue';
	readTimeMin?: number;
	chapterCount?: number;
	publishedAt?: string;
	keywords?: string;
	editorial?: {
		title: string;
		lastUpdated?: string;
		body: string;
	};
	keyTakeaways?: readonly KeyTakeaway[];
}

export interface ActiveExplainer {
	meta: ExplainerMetaLike;
	chapters: Chapter[];
	sources: Record<string, Source>;
	terms: Record<string, Term>;
	imageManifest: ImageEntry[];
	getSource: (id: string) => Source | undefined;
	getTerm: (id: string) => Term | undefined;
	getImage: (name: string) => ImageEntry | undefined;
}

class ExplainerHolder {
	current = $state<ActiveExplainer | null>(null);
}

const KEY = Symbol('pixelpoetry/active-explainer');

/** Call once from `+layout.svelte` to provide the holder to all descendants. */
export function provideExplainerHolder(): ExplainerHolder {
	const holder = new ExplainerHolder();
	setContext(KEY, holder);
	return holder;
}

/** Internal — get the holder from context, or `undefined` if not provided. */
export function getExplainerHolder(): ExplainerHolder | undefined {
	return getContext<ExplainerHolder | undefined>(KEY);
}

/**
 * Reactively read the currently active explainer (or `null` on non-essay
 * routes). Returns the same reactive proxy on every call so any component
 * that reads it will re-render when the holder updates.
 */
export function getActiveExplainer(): ActiveExplainer | null {
	return getExplainerHolder()?.current ?? null;
}

/**
 * Set the active explainer. Call from an explainer's `+page.svelte`
 * `<script>` top-level — `getContext` only works during component init.
 *
 * For cleanup on navigation, capture the holder once during init and
 * mutate `holder.current = null` directly inside `onDestroy`.
 */
export function setActiveExplainer(value: ActiveExplainer | null): void {
	const holder = getExplainerHolder();
	if (holder) holder.current = value;
}

/**
 * Convenience helper for explainer pages:
 *   activateExplainer(ultraProcessed);
 * Captures the holder during component init, sets the value, and returns
 * a destroy function that clears it only if this page is still the active
 * owner. That avoids an old route clearing the next explainer during
 * client-side story-to-story navigation.
 */
export function activateExplainer(value: ActiveExplainer): () => void {
	const holder = getExplainerHolder();
	if (holder) holder.current = value;
	return () => {
		if (holder?.current === value) holder.current = null;
	};
}
