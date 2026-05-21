<script lang="ts">
	/**
	 * <Scrolly> — the project's scrollytelling primitive.
	 *
	 * Desktop layout (lg+) — a clean 50/50 grid that NEVER reshapes
	 * based on the active step.
	 *
	 *   ┌─────────────────┬─────────────────┐
	 *   │  story  (1fr)   │  viz  (1fr)     │
	 *   │  scrolling text │  sticky, pinned │
	 *   └─────────────────┴─────────────────┘
	 *
	 * CRITICAL: the layout is FIXED across all beats. We do NOT collapse
	 * the viz column to full width when a step happens to have nothing
	 * visual to show. Earlier versions did that and produced a jarring
	 * jump — the SAME piece of text would scroll through the viewport
	 * centred (while a text-only step was active) and then snap to the
	 * narrow column (when the next step became active), even though the
	 * reader was looking at the same words the whole time.
	 *
	 * For the rare narrative beats with no chart / stat / quote, the
	 * viz column simply stays empty. The whitespace reads as editorial
	 * breathing room, not broken layout, because the text's column
	 * position never changes.
	 *
	 * On mobile the layout collapses to a single stacked column.
	 *
	 * Slots:
	 *   - `viz` snippet: pinned visualisation. Receives `{ progress, activeStep, stepProgress }`.
	 *   - `steps` snippet: array of step blocks. Receives `{ activeStep }`.
	 *
	 * The actual scroll-to-state wiring lives in `$lib/attachments/scrolly.ts`.
	 */
	import type { Snippet } from 'svelte';
	import { scrolly } from '$lib/attachments/scrolly';
	import { cn } from '$lib/utils/cn';

	interface Props {
		viz: Snippet<[{ progress: number; activeStep: number; stepProgress: number }]>;
		steps: Snippet<[{ activeStep: number }]>;
		/** Optional extra Tailwind classes for the section root. */
		class?: string;
		/** Layout side for the viz on desktop. Default 'right'. */
		vizSide?: 'left' | 'right';
		/** Fired when active step changes. */
		onActiveStep?: (step: number) => void;
	}

	let {
		viz,
		steps,
		class: className,
		vizSide = 'right',
		onActiveStep
	}: Props = $props();

	let progress = $state(0);
	let activeStep = $state(0);
	let stepProgress = $state(0);

	/**
	 * Shadow of `activeStep` used ONLY inside the scrolly callback for the
	 * "did the step change?" check. Reading `$state` proxies inside the
	 * callback would establish a reactive dependency on the attachment's
	 * own effect, and the subsequent write would re-run the attachment —
	 * tearing down and rebuilding every GSAP ScrollTrigger on every scroll
	 * tick (an 8000+ rebuilds/sec re-attach loop in practice).
	 */
	let lastNotifiedStep = -1;

	/**
	 * Stable attachment reference. CRITICAL: created once at script init
	 * (not inline in the template), so Svelte's `{@attach}` doesn't see a
	 * new function on every render. The callback uses only WRITES into
	 * `$state` (writes don't establish reactive reads), and a non-reactive
	 * `lastNotifiedStep` for the change check, so the attachment's effect
	 * never gains a reactive dependency on `activeStep`.
	 */
	const scrollyAttachment = scrolly({
		onProgress: (p, step, sp) => {
			progress = p;
			stepProgress = sp;
			if (step !== lastNotifiedStep) {
				lastNotifiedStep = step;
				activeStep = step;
				onActiveStep?.(step);
			}
		}
	});
</script>

<section
	{@attach scrollyAttachment}
	class={cn(
		// Base: single column on mobile, vertical gap between viz and story.
		'relative grid w-full min-w-0 grid-cols-1 gap-y-10 lg:gap-x-10 xl:gap-x-14',
		// Desktop: 2-track template at a clean 50/50 split. Equal-width
		// columns read as a deliberate editorial pairing — text on one
		// side, a visualisation of equal weight on the other — instead of
		// one column visibly dominating the other.
		//
		// `minmax(0, 1fr)` is essential on both tracks: without the `0`
		// minimum, content like long words or wide SVGs can push the
		// track wider than its container and break the centre-line of
		// the page.
		//
		// (The `vizSide` prop still controls which content lands in which
		// column — see the `col-start` rules below — but the tracks
		// themselves are symmetric, so we use a single template.)
		'lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]',
		className
	)}
>
	<!--
		Viz column — sticky on desktop ONLY.
		On mobile we hide this column entirely (`hidden lg:flex`); each
		step renders its own viz inline below its text card (see
		`Chapter.svelte`'s `steps` snippet). Inlining on mobile avoids
		the classic "text card occludes the top of the chart" problem
		that the sticky overlay pattern causes on narrow viewports.
	-->
	<div
		data-scrolly-viz
		data-viz-sticky
		class={cn(
			'hidden min-w-0 items-center justify-center overflow-hidden',
			'lg:sticky lg:top-(--nav-h) lg:z-0 lg:flex',
			'lg:h-[calc(100svh-var(--nav-h,4rem))]',
			vizSide === 'left' ? 'lg:col-start-1' : 'lg:col-start-2'
		)}
	>
		{@render viz({ progress, activeStep, stepProgress })}
	</div>

	<!--
		Story column — always sits opposite the viz, always left-aligned.
		Never spans full width: the reader sees text in a consistent
		position regardless of which step is currently active.
	-->
	<div
		data-scrolly-story
		class={cn(
			'relative z-10 min-w-0 w-full text-left',
			vizSide === 'left' ? 'lg:col-start-2' : 'lg:col-start-1'
		)}
	>
		{@render steps({ activeStep })}
	</div>
</section>
