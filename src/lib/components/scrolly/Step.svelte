<script lang="ts">
	/**
	 * <Step> — a single scroll-driven beat. Lives inside the `steps` snippet
	 * of <Scrolly>.
	 *
	 * Architecture (standard editorial scrolly)
	 * -----------------------------------------
	 *   - Each step is a TALL block in normal document flow (~100svh).
	 *   - The text content sits in the UPPER THIRD of the block via
	 *     `pt-[14svh]`, so the moment a new step's trigger fires (matching
	 *     line in `scrolly.ts`), the user already sees the new text near
	 *     the top of the viewport. From there it scrolls naturally upward
	 *     as the user continues scrolling, exits via the top, and the next
	 *     step's text rises up from below.
	 *   - NO opacity gating. With tall, opaque step blocks in normal flow,
	 *     at any scroll position the viewport shows at most one step's
	 *     content prominently — opacity cross-fades would only fight the
	 *     natural scroll motion and cause flickers at boundaries.
	 *   - NO sticky positioning. Sticky was tried and caused two adjacent
	 *     steps' content to overlap at boundary scroll positions (the
	 *     classic "two beats on the same y" flicker).
	 *
	 * Mobile (default): text renders as an opaque card so it stays
	 * readable over the sticky viz behind it. Desktop (lg+): clean
	 * editorial prose, no backing — the viz lives in the opposite grid
	 * column, no overlap to mask.
	 */
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils/cn';
	import { openTermSheet } from '$lib/context/sheet';

	function handleClick(e: MouseEvent) {
		const termEl = (e.target as HTMLElement).closest('[data-term]') as HTMLElement | null;
		if (termEl?.dataset.term) {
			e.preventDefault();
			openTermSheet(termEl.dataset.term);
		}
	}

	interface Props {
		/**
		 * Whether this step is the currently active beat. Kept for
		 * API back-compat; not used for opacity gating any more. May be
		 * used to tag the active block for screen-reader or future
		 * styling needs.
		 */
		isActive?: boolean;
		children: Snippet;
		class?: string;
	}

	let { isActive = false, children, class: className }: Props = $props();
</script>

<!-- svelte-ignore a11y_no_static_element_interactions a11y_no_noninteractive_element_interactions a11y_click_events_have_key_events -->
<div
	data-scrolly-step
	data-active={isActive ? 'true' : 'false'}
	onclick={handleClick}
	class={cn(
		// Desktop: 100svh tall gives the sticky viz column enough runway
		// to sit for one full viewport per beat. Mobile: no sticky column,
		// so steps only need to be tall enough to read — 0 min-height,
		// natural padding only.
		'flex w-full min-w-0 items-start pb-[6svh]',
		'pt-8 lg:min-h-svh lg:pt-[14svh]',
		className
	)}
>
	<!--
		Mobile: full-width opaque card so the text stays readable over the
		sticky viz sitting behind it.
		Desktop (lg+): clean editorial prose. The viz is in the opposite
		grid column, no overlap to mask.

		`w-full min-w-0` so the card respects its grid track and never
		forces its parent wider than the viewport.
	-->
	<div
		class={cn(
			'mx-auto w-full min-w-0 rounded-3xl border border-ink/8',
			'bg-cream px-5 py-7 shadow-lg sm:px-6',
			'lg:rounded-none lg:border-none',
			'lg:bg-transparent lg:px-0 lg:py-0 lg:shadow-none'
		)}
	>
		{@render children()}
	</div>
</div>
