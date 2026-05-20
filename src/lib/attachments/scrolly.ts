import type { Attachment } from 'svelte/attachments';

/**
 * Scrolly attachment. Tracks scroll progress within a scrollytelling section
 * and fires `onProgress` so the viz column knows which step is active.
 *
 * Orchestration intent
 * --------------------
 * Each step block is taller than the viewport (`min-h: 130svh`) and renders
 * its text at the TOP of its box (`items-start`). The chart on the other
 * side should swap to the next step's viz at the precise moment the next
 * step's text appears at the top of the viewport — every time, identically,
 * regardless of which beat the reader is on.
 *
 * To get that consistent trigger line we use ONE ScrollTrigger PER STEP
 * (not a single trigger that maps overall progress → step index). Each
 * per-step trigger fires when that step's top crosses a fixed line near
 * the top of the viewport (`top 28%`). This gives:
 *   - constant trigger position on screen across all steps
 *   - chart swap = text-appears-at-top moment (1:1 sync)
 *   - smooth `stepProgress` available for any future scroll-driven viz
 *
 * The viz column is positioned with CSS `sticky top-0` — no GSAP pin.
 * CSS sticky is scope-contained to its grid parent, so it releases
 * naturally when the section scrolls out of view (avoiding layering bugs
 * between consecutive chapters).
 *
 * Reduced-motion: falls back to a lightweight IntersectionObserver tuned
 * to the same top-of-viewport trigger band.
 */
export interface ScrollyOptions {
	/**
	 * Called whenever the active step changes or the overall progress updates.
	 *
	 * @param progress 0–1 progress across the whole scrolly section.
	 * @param activeStep 0-based index of the currently active step.
	 * @param stepProgress 0–1 progress within the active step.
	 */
	onProgress?: (progress: number, activeStep: number, stepProgress: number) => void;
}

let pluginRegistered = false;

/**
 * Where the trigger line sits in the viewport, expressed as a percentage
 * from the top.
 *
 * At 70% the swap fires when the step's top edge is still 30% from the
 * bottom of the viewport — i.e. the moment the text first enters from
 * the bottom. This gives an "image leads the text" feel: the viz is
 * already showing before the reader has started reading the new step.
 *
 * Lower values fire later (text already high on screen); higher values
 * fire earlier (text barely entering at the bottom). 70 is the sweet spot
 * for "swap on entry from bottom".
 */
const TRIGGER_LINE_PCT = 70;

export function scrolly(options: ScrollyOptions = {}): Attachment {
	return (root) => {
		const element = root as HTMLElement;
		const prefersReducedMotion =
			typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		const stepNodes = Array.from(element.querySelectorAll<HTMLElement>('[data-scrolly-step]'));

		if (stepNodes.length === 0) return;
		const total = stepNodes.length;

		// --------------------------------------------------------------
		// Reduced motion: skip GSAP, use a top-of-viewport IO band.
		// --------------------------------------------------------------
		if (prefersReducedMotion) {
			// Trigger band: a thin slice near the top of the viewport that
			// matches the GSAP `TRIGGER_LINE_PCT` line above.
			const observer = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (entry.isIntersecting) {
							const index = stepNodes.indexOf(entry.target as HTMLElement);
							if (index >= 0) options.onProgress?.(index / total, index, 0.5);
						}
					}
				},
				{
					rootMargin: `-${TRIGGER_LINE_PCT}% 0px -${100 - TRIGGER_LINE_PCT - 4}% 0px`,
					threshold: 0
				}
			);
			stepNodes.forEach((node) => observer.observe(node));
			return () => observer.disconnect();
		}

		// --------------------------------------------------------------
		// Full GSAP / ScrollTrigger path. Lazy import keeps GSAP out of
		// chunks that don't need it.
		// --------------------------------------------------------------
		let triggers: Array<{ kill: () => void }> = [];
		let cancelled = false;
		let currentActive = 0;

		(async () => {
			const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
				import('gsap'),
				import('gsap/ScrollTrigger')
			]);

			if (cancelled) return;

			if (!pluginRegistered) {
				gsap.registerPlugin(ScrollTrigger);
				pluginRegistered = true;
			}

			const setActive = (i: number, stepProgress: number) => {
				currentActive = i;
				options.onProgress?.((i + stepProgress) / total, i, stepProgress);
			};

			// One ScrollTrigger per step. Active while the step's content
			// straddles the fixed trigger line near the top of the viewport.
			stepNodes.forEach((node, i) => {
				const t = ScrollTrigger.create({
					trigger: node,
					start: `top ${TRIGGER_LINE_PCT}%`,
					end: `bottom ${TRIGGER_LINE_PCT}%`,
					onToggle: (self) => {
						if (self.isActive) setActive(i, self.progress);
					},
					onUpdate: (self) => {
						// Only stream stepProgress for the currently-active
						// step; the rest stay quiet to avoid thrash.
						if (self.isActive && currentActive === i) {
							setActive(i, self.progress);
						}
					}
				});
				triggers.push(t);
			});
		})();

		return () => {
			cancelled = true;
			triggers.forEach((t) => t.kill());
			triggers = [];
		};
	};
}
