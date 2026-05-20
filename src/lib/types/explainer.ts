/**
 * Shared explainer types. These are the building blocks every essay reuses:
 * Chapter, Step, Stat, Quote, and the typed VizConfig union that drives the
 * scrollytelling viz column.
 *
 * Adding a new chart? Add its interface + extend `VizConfig` here, then
 * branch on `step.viz?.type` inside `Chapter.svelte`.
 */

export interface Stat {
	value: string;
	unit?: string;
	label: string;
	context?: string;
	sourceId?: string;
}

export interface Quote {
	text: string;
	attribution: string;
	sourceId?: string;
}

export interface Step {
	id: string;
	/** Plain-text fallback used for SEO / accessibility. */
	text: string;
	/**
	 * Optional HTML version of `text` with <strong> tags for key phrases.
	 * Rendered via {@html} — safe because it is hardcoded, never user input.
	 */
	richText?: string;
	stat?: Stat;
	quote?: Quote;
	/** Chart to render in the Scrolly viz slot. */
	viz?: VizConfig;
	/**
	 * Optional large decorative letter displayed above the step prose
	 * in the chapter's accent colour. Used to visually surface acronym
	 * letters (e.g. "S", "M", "E", "D" for S-MEDs).
	 */
	accentLetter?: string;
	/**
	 * When true the step is excluded from the scrolly body but still
	 * picked up by the closing-quotes renderer at the bottom of the
	 * chapter. Use for quote steps that should only appear as a large
	 * editorial pull-quote, not as a small inline text card.
	 */
	closingOnly?: boolean;
}

export interface Chapter {
	id: string;
	number: number;
	eyebrow: string;
	/** Decorative emoji shown to the left of the eyebrow text. */
	emoji?: string;
	title: string;
	/** Shorter title for compact contexts like the mobile nav. Falls back to `title`. */
	shortTitle?: string;
	intro: string;
	accent: AccentColor;
	steps: Step[];
	sources?: string[];
}

export type AccentColor = 'red' | 'amber' | 'pink' | 'ink' | 'forest' | 'blue';

// ─────────────────────────────────────────────────────────────────────────────
// Viz primitives
// ─────────────────────────────────────────────────────────────────────────────

export interface BubbleDataPoint {
	label: string;
	value: number;
	category: string;
}
export interface BarDataPoint {
	label: string;
	value: number;
	category?: string;
	year?: number;
}
export interface LineSeries {
	name: string;
	color: string;
	data: Array<{ year: number; value: number }>;
}
export interface DonutDataPoint {
	label: string;
	value: number;
	color: string;
}

export interface ObsBarDataPoint {
	label: string;
	value: number;
	/** If set, bars are faceted by label and grouped by this field (e.g. "Before" / "After"). */
	group?: string;
	/** Override bar colour (hex). */
	color?: string;
}

export interface ImageViz {
	type: 'image';
	/** Image name — must match an entry in the active explainer's image-manifest.ts. */
	name: string;
	alt?: string;
	caption?: string;
	/** Optional source ID — renders an inline "Source" link below the caption. */
	sourceId?: string;
	/**
	 * Photo credit line shown below the image (photographer, agency, licence, or copyright holder).
	 * Required for any image not created in-house.
	 */
	credit?: string;
	/**
	 * How the image fills its frame. Defaults to `cover` (editorial photo).
	 * Use `contain` for product shots / logos with transparent backgrounds.
	 */
	fit?: 'cover' | 'contain';
	/** Frame aspect ratio. Defaults to `4/5` (portrait). */
	aspect?: '4/5' | 'square' | 'auto';
	/** Extra Tailwind classes passed to the <img> element — for per-image optical
	 * corrections, e.g. `translate-x-3 lg:translate-x-0` to counteract a shadow. */
	imgClass?: string;
}

export interface BarViz {
	type: 'bar';
	data: BarDataPoint[];
	yearStart?: number;
	yearEnd?: number;
}
export interface BubbleViz {
	type: 'bubble';
	data: BubbleDataPoint[];
}
export interface LineViz {
	type: 'line';
	data: LineSeries[];
}
export interface DonutViz {
	type: 'donut';
	data: DonutDataPoint[];
}

/** Observable Plot powered horizontal bar chart — beautiful, static, editorial. */
export interface ObsBarViz {
	type: 'obs-bar';
	data: ObsBarDataPoint[];
	title?: string;
	subtitle?: string;
	unit?: string;
	/** Prefix prepended to value labels (e.g. "+" for risk increases). */
	prefix?: string;
	/** Source ID to show as a bottom-sheet link below the chart. */
	sourceId?: string;
}

export interface TimelinePoint {
	year: number;
	value: number;
}
export interface TimelineSeries {
	label: string;
	color: string;
	points: TimelinePoint[];
}

/** Observable Plot powered multi-series timeline / line chart. */
export interface ObsTimelineViz {
	type: 'obs-timeline';
	series: TimelineSeries[];
	title?: string;
	subtitle?: string;
	unit?: string;
	/** Force the x-axis range; otherwise derived from data with light padding. */
	domain?: [number, number];
	/** Force the y-axis range; otherwise derived from data. */
	valueDomain?: [number, number];
	sourceId?: string;
}

export type VizConfig =
	| ImageViz
	| BarViz
	| BubbleViz
	| LineViz
	| DonutViz
	| ObsBarViz
	| ObsTimelineViz;

// ─────────────────────────────────────────────────────────────────────────────
// Source / Term / Image — the lookup tables every explainer needs
// ─────────────────────────────────────────────────────────────────────────────

export interface Source {
	id: string;
	short: string;
	full: string;
	url?: string;
	year: number;
	/**
	 * Optional list of primary studies this source draws upon — shown in the
	 * source sheet to give readers the underlying peer-reviewed evidence rather
	 * than just a link to a book or article.
	 */
	references?: Array<{ citation: string; url?: string }>;
}

export interface Term {
	id: string;
	name: string;
	/** Single-sentence, plain-language definition. */
	short: string;
	/** 2–3 sentences of context. */
	long: string;
	url?: string;
	urlLabel?: string;
}

export interface ImageVariant {
	width: number;
	src: string;
}

export interface ImageEntry {
	name: string;
	width: number;
	height: number;
	blurhash: string;
	variants: ImageVariant[];
	credit?: string;
}
