/**
 * Explainer colour theme system.
 *
 * Each accent value maps to a complete set of Tailwind class strings for
 * every themed UI surface: nav badge, progress-bar gradient, active-dot
 * colour, focus ring, and tooltip number.
 *
 * Rules:
 *   - All class strings are COMPLETE (no dynamic string interpolation) so
 *     Tailwind's JIT scanner can detect them at build time.
 *   - Never assemble partial class names at runtime (e.g. `text-brand-${x}`).
 *   - Add a new entry here whenever a new AccentColor is added to the type.
 *
 * Usage:
 *   import { getTheme } from '$lib/utils/explainer-theme';
 *   const theme = $derived(getTheme(explainer?.meta.accent));
 *   <span class={theme.badgeText}>{shortName}</span>
 */

export type AccentColor = 'red' | 'amber' | 'pink' | 'ink' | 'forest' | 'blue';

export interface ExplainerTheme {
	/** Tailwind text class for the nav short-name badge (e.g. "LNG"). */
	badgeText: string;
	/** Tailwind text class for the chapter-number pill inside nav tooltip. */
	tooltipNumber: string;
	/** Tailwind bg+gradient classes for the progress-bar fill. */
	barGradient: string;
	/** Tailwind classes for the active-chapter dot (border + bg + ring). */
	activeDot: string;
	/** Tailwind focus-visible ring class on chapter marker links. */
	focusRing: string;
	/** Tailwind hover class for the "Sources" pill in the nav right-rail. */
	sourcesHover: string;
	/** Tailwind hover class for the Sources button in the nav right-rail. */
	sourcesBg: string;
}

const themes: Record<AccentColor, ExplainerTheme> = {
	red: {
		badgeText: 'text-brand-red',
		tooltipNumber: 'text-brand-amber',
		barGradient: 'bg-gradient-to-r from-brand-red via-brand-amber to-brand-pink',
		activeDot: 'border-brand-red bg-brand-red shadow-[0_0_0_4px_rgb(254_249_239)]',
		focusRing: 'group-focus-visible:ring-brand-red',
		sourcesHover: 'hover:bg-brand-red',
		sourcesBg: 'bg-brand-red'
	},
	forest: {
		badgeText: 'text-brand-forest',
		tooltipNumber: 'text-brand-ocean',
		barGradient: 'bg-gradient-to-r from-brand-forest via-brand-ocean to-brand-sky',
		activeDot: 'border-brand-forest bg-brand-forest shadow-[0_0_0_4px_rgb(254_249_239)]',
		focusRing: 'group-focus-visible:ring-brand-forest',
		sourcesHover: 'hover:bg-brand-forest',
		sourcesBg: 'bg-brand-forest'
	},
	amber: {
		badgeText: 'text-brand-amber',
		tooltipNumber: 'text-yellow-500',
		barGradient: 'bg-gradient-to-r from-brand-amber via-yellow-400 to-amber-200',
		activeDot: 'border-brand-amber bg-brand-amber shadow-[0_0_0_4px_rgb(254_249_239)]',
		focusRing: 'group-focus-visible:ring-brand-amber',
		sourcesHover: 'hover:bg-brand-amber',
		sourcesBg: 'bg-brand-amber'
	},
	pink: {
		badgeText: 'text-brand-pink',
		tooltipNumber: 'text-rose-400',
		barGradient: 'bg-gradient-to-r from-brand-pink via-rose-400 to-pink-300',
		activeDot: 'border-brand-pink bg-brand-pink shadow-[0_0_0_4px_rgb(254_249_239)]',
		focusRing: 'group-focus-visible:ring-brand-pink',
		sourcesHover: 'hover:bg-brand-pink',
		sourcesBg: 'bg-brand-pink'
	},
	blue: {
		badgeText: 'text-brand-ocean',
		tooltipNumber: 'text-brand-sky',
		barGradient: 'bg-gradient-to-r from-brand-ocean-deep via-brand-ocean to-brand-sky',
		activeDot: 'border-brand-ocean bg-brand-ocean shadow-[0_0_0_4px_rgb(254_249_239)]',
		focusRing: 'group-focus-visible:ring-brand-ocean',
		sourcesHover: 'hover:bg-brand-ocean',
		sourcesBg: 'bg-brand-ocean'
	},
	ink: {
		badgeText: 'text-ink',
		tooltipNumber: 'text-ink/50',
		barGradient: 'bg-gradient-to-r from-ink via-ink/60 to-ink/25',
		activeDot: 'border-ink bg-ink shadow-[0_0_0_4px_rgb(254_249_239)]',
		focusRing: 'group-focus-visible:ring-ink',
		sourcesHover: 'hover:bg-ink',
		sourcesBg: 'bg-ink'
	}
};

const DEFAULT_THEME = themes.red;

/**
 * Returns the full theme token set for a given accent.
 * Falls back to the red theme if `accent` is undefined or unrecognised.
 */
export function getTheme(accent: AccentColor | undefined | null): ExplainerTheme {
	if (!accent) return DEFAULT_THEME;
	return themes[accent] ?? DEFAULT_THEME;
}
