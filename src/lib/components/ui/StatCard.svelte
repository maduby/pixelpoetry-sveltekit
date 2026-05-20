<script lang="ts">
	/**
	 * <StatCard> — big-number editorial reveal with ease-out count-up.
	 *
	 * The value renders as a giant slab-serif headline. `unit` is shown as a
	 * smaller superscript-style suffix. `label` sits beneath as the sentence-
	 * style explanation.
	 *
	 * Animation: when the card enters the viewport, the number counts up from 0
	 * to its final value with an ease-out-quad deceleration (fast start, slow
	 * finish) over ~1.4 seconds.
	 */
	import { onDestroy } from 'svelte';
	import { getActiveExplainer } from '$lib/context/explainer.svelte';
	import { openSourceSheet } from '$lib/context/sheet';
	import { cn } from '$lib/utils/cn';
	import type { Stat } from '$lib/types/explainer';

	const explainer = $derived(getActiveExplainer());

	interface Props {
		stat: Stat;
		/** Set to true to skip animation (e.g. prefers-reduced-motion) */
		manualTrigger?: boolean;
		accent?: 'red' | 'amber' | 'pink' | 'ink';
		class?: string;
	}

	let { stat, manualTrigger = false, accent = 'red', class: className }: Props = $props();

	// -----------------------------------------------------------------------
	// Parsed numeric value
	// -----------------------------------------------------------------------
	const numericValue = $derived(() => {
		const m = stat.value.match(/-?\d+(?:\.\d+)?/);
		return m ? parseFloat(m[0]) : null;
	});

	const sign = $derived(stat.value.trim().startsWith('+') ? '+' : '');

	// -----------------------------------------------------------------------
	// Count-up animation state
	// -----------------------------------------------------------------------
	let displayValue = $state('0');
	let animationStarted = $state(false);

	// Animation params
	const DURATION_MS = 1400;

	function easeOutQuad(t: number): number {
		return t * (2 - t); // ease-out-quad: fast start, decelerates to 0
	}

	/**
	 * Tracks the in-flight rAF so we can bail if the component is
	 * destroyed mid-animation (e.g. when <Chapter>'s `{#key activeStep}`
	 * swaps the viz column to a different step). Without this guard the
	 * tick keeps reading the now-undefined `stat` prop and throws.
	 */
	let rafId: number | null = null;
	let destroyed = false;

	onDestroy(() => {
		destroyed = true;
		if (rafId !== null) cancelAnimationFrame(rafId);
	});

	function animateCountUp(target: number) {
		if (typeof window === 'undefined') {
			displayValue = format(target);
			return;
		}
		const start = performance.now();

		function tick(now: number) {
			if (destroyed) return;
			const elapsed = now - start;
			const t = Math.min(elapsed / DURATION_MS, 1);
			const eased = easeOutQuad(t);
			displayValue = format(eased * target);
			if (t < 1) {
				rafId = requestAnimationFrame(tick);
			} else {
				displayValue = format(target); // snap to final
				rafId = null;
			}
		}

		rafId = requestAnimationFrame(tick);
	}

	function format(value: number): string {
		if (destroyed) return '';
		const n = numericValue();
		if (n === null) return stat.value;
		const decimals = Number.isInteger(n) ? 0 : 1;
		return `${sign}${value.toFixed(decimals)}`;
	}

	// -----------------------------------------------------------------------
	// IntersectionObserver — trigger animation when card enters viewport
	// -----------------------------------------------------------------------
	let cardEl = $state<HTMLElement | undefined>(undefined);

	$effect(() => {
		if (!cardEl || manualTrigger) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !animationStarted) {
					animationStarted = true;
					const target = numericValue();
					if (target !== null) animateCountUp(target);
				}
			},
			{ threshold: 0.3 }
		);
		observer.observe(cardEl);
		return () => observer.disconnect();
	});

	// -----------------------------------------------------------------------
	// Static display value (used when animation is skipped)
	// -----------------------------------------------------------------------
	$effect(() => {
		if (manualTrigger && !animationStarted) {
			animationStarted = true;
			const target = numericValue();
			if (target !== null) displayValue = format(target);
		}
	});

	// -----------------------------------------------------------------------
	// Style helpers
	// -----------------------------------------------------------------------
	const gradientClass = $derived(
		{ red: 'gradient-warning', amber: 'gradient-amber', pink: 'gradient-shock', ink: 'text-ink' }[
			accent
		]
	);

	const source = $derived(stat.sourceId ? explainer?.getSource(stat.sourceId) : undefined);
</script>

<figure
	bind:this={cardEl}
	class={cn('mx-auto flex min-w-0 w-full max-w-3xl flex-col items-center gap-4 text-center', className)}
>
	<!--
		Number + unit inline, centred. `flex-wrap` so a very long value wraps
		gracefully instead of overflowing. Clamp is proportional to the viewport:
		on a 1024px width the number lands at ~10rem (160px) — bold but not
		drowning the explanatory text beneath.
	-->
	<div class="flex min-w-0 flex-wrap items-baseline justify-center gap-x-2 leading-none">
		<span
			class={cn('font-display text-[clamp(4.5rem,12vw,9.5rem)] font-bold', gradientClass)}
		>
			{displayValue}
		</span>
		{#if stat.unit}
			<span class={cn('font-display text-[clamp(1.75rem,5vw,4rem)] font-bold', gradientClass)}>
				{stat.unit}
			</span>
		{/if}
	</div>

	<figcaption class="max-w-xl space-y-2 text-lg text-balance text-center text-ink/80">
		<p class="leading-snug font-medium">{stat.label}</p>
		{#if stat.context}
			<p class="text-base text-ink/60">{stat.context}</p>
		{/if}
		{#if source}
			<button
				type="button"
				onclick={() => openSourceSheet(source!.id)}
				class="group mx-auto flex cursor-pointer items-center gap-1 text-sm font-semibold text-ink/40 transition-colors hover:text-brand-red"
			>
				<span>Source</span>
				<svg
					aria-hidden="true"
					class="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
					viewBox="0 0 12 12"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M2 10 L10 2 M4 2 H10 V8" />
				</svg>
			</button>
		{/if}
	</figcaption>
</figure>