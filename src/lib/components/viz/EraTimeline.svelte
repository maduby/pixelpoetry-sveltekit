<script lang="ts">
	import { onMount } from 'svelte';
	import type { EraData } from '$lib/types/explainer';

	interface Props {
		eras: EraData[];
		title?: string;
	}

	let { eras, title }: Props = $props();

	// ── SVG coordinate space ──────────────────────────────────────────────────
	const SVG_W = 480;
	const PAD_L = 16;
	const PAD_R = 20;
	const CHART_W = SVG_W - PAD_L - PAD_R;

	// Time domain
	const YEAR_MIN = 1840;
	const YEAR_MAX = 2040;
	const YEAR_RANGE = YEAR_MAX - YEAR_MIN;

	// Row geometry — label above, bar, keyword below
	const BAR_H = 42;
	const ROW_STRIDE = 86; // label_h + gap + bar_h + keyword_h + spacing
	const FIRST_BAR_Y = 30; // top of first bar (label sits above at FIRST_BAR_Y - 19)

	// X-axis sits below all bars
	const AXIS_Y = $derived(FIRST_BAR_Y + eras.length * ROW_STRIDE + 8);
	const SVG_H = $derived(AXIS_Y + 28);

	// Year ticks shown on the axis
	const YEAR_TICKS = [1850, 1900, 1950, 2000, 2025];

	function toX(year: number): number {
		return PAD_L + ((year - YEAR_MIN) / YEAR_RANGE) * CHART_W;
	}

	function barY(index: number): number {
		return FIRST_BAR_Y + index * ROW_STRIDE;
	}

	// Arrowhead: right-pointing triangle capping the ongoing bar
	function arrowPoints(x: number, midY: number): string {
		const tip = x + 13;
		const half = BAR_H / 2;
		return `${x},${midY - half} ${tip},${midY} ${x},${midY + half}`;
	}

	// ── Animation ─────────────────────────────────────────────────────────────
	let visible = $state(false);
	let containerEl = $state<SVGSVGElement | undefined>(undefined);

	const prefersReducedMotion =
		typeof window !== 'undefined' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	onMount(() => {
		if (prefersReducedMotion) {
			visible = true;
			return;
		}
		const io = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					visible = true;
					io.disconnect();
				}
			},
			{ threshold: 0.15 }
		);
		if (containerEl) io.observe(containerEl);
		return () => io.disconnect();
	});
</script>

<div class="w-full select-none">
	{#if title}
		<p class="mb-3 text-[10px] font-semibold uppercase tracking-widest opacity-40">{title}</p>
	{/if}

	<svg
		bind:this={containerEl}
		viewBox="0 0 {SVG_W} {SVG_H}"
		class="w-full overflow-visible"
		role="img"
		aria-label="Three eras of medicine timeline"
	>
		{#each eras as era, i}
			{@const x0 = toX(era.startYear)}
			{@const x1 = era.endYear ? toX(era.endYear) : SVG_W - PAD_R - 14}
			{@const bw = x1 - x0}
			{@const by = barY(i)}
			{@const midY = by + BAR_H / 2}
			{@const delay = i * 250}
			{@const textDelay = delay + 460}

			<!-- Era title above bar (small caps, era colour) -->
			<text
				x={x0}
				y={by - 7}
				fill={era.color}
				font-size="10"
				font-weight="700"
				font-family="inherit"
				letter-spacing="0.04em"
				text-anchor="start"
				class="era-label"
				class:animate={visible}
				style="animation-delay: {textDelay}ms"
			>{era.title}</text>

			<!-- Start-year annotation above bar left edge (muted) -->
			<text
				x={x0}
				y={by - 7}
				fill="currentColor"
				fill-opacity="0"
				font-size="0"
			/>

			<!-- Main coloured bar -->
			<rect
				x={x0}
				y={by}
				width={bw}
				height={BAR_H}
				rx="6"
				fill={era.color}
				opacity="0.88"
				class="era-bar"
				class:animate={visible}
				style="animation-delay: {delay}ms"
			/>

			<!-- Arrowhead cap on ongoing eras -->
			{#if !era.endYear}
				<polygon
					points={arrowPoints(x1, midY)}
					fill={era.color}
					opacity="0.88"
					class="era-bar"
					class:animate={visible}
					style="animation-delay: {delay}ms"
				/>
			{/if}

			<!-- Start year below bar left edge -->
			<text
				x={x0 + 2}
				y={by + BAR_H + 14}
				fill="currentColor"
				fill-opacity="0.38"
				font-size="9"
				font-family="inherit"
				class="era-label"
				class:animate={visible}
				style="animation-delay: {textDelay}ms"
			>{era.startYear}</text>

			<!-- End year or "now" below bar right edge -->
			{#if era.endYear}
				<text
					x={x1}
					y={by + BAR_H + 14}
					fill="currentColor"
					fill-opacity="0.3"
					font-size="9"
					font-family="inherit"
					text-anchor="end"
					class="era-label"
					class:animate={visible}
					style="animation-delay: {textDelay}ms"
				>{era.endYear}s</text>
			{:else}
				<text
					x={x1 + 17}
					y={midY + 1}
					fill="currentColor"
					fill-opacity="0.35"
					font-size="9"
					font-family="inherit"
					dominant-baseline="middle"
					class="era-label"
					class:animate={visible}
					style="animation-delay: {textDelay}ms"
				>now</text>
			{/if}

			<!-- Keyword subtitle below start/end year labels -->
			<text
				x={x0 + 2}
				y={by + BAR_H + 26}
				fill="currentColor"
				fill-opacity="0.4"
				font-size="9"
				font-family="inherit"
				class="era-label"
				class:animate={visible}
				style="animation-delay: {textDelay + 60}ms"
			>{era.keyword}</text>
		{/each}

		<!-- X-axis line -->
		<line
			x1={PAD_L}
			y1={AXIS_Y}
			x2={SVG_W - PAD_R}
			y2={AXIS_Y}
			stroke="currentColor"
			stroke-opacity="0.12"
			stroke-width="1"
		/>

		<!-- Year tick marks + labels -->
		{#each YEAR_TICKS as year}
			{@const tx = toX(year)}
			<line
				x1={tx}
				y1={AXIS_Y}
				x2={tx}
				y2={AXIS_Y + 4}
				stroke="currentColor"
				stroke-opacity="0.22"
				stroke-width="1"
			/>
			<text
				x={tx}
				y={AXIS_Y + 14}
				fill="currentColor"
				fill-opacity="0.38"
				font-size="9"
				font-family="inherit"
				text-anchor="middle"
			>{year}</text>
		{/each}
	</svg>
</div>

<style>
	/* ── Bar slide-in ───────────────────────────────────────────────────────── */
	.era-bar {
		transform-box: fill-box;
		transform-origin: left center;
		transform: scaleX(0);
	}

	.era-bar.animate {
		animation: era-slide-in 0.55s cubic-bezier(0.4, 0, 0.2, 1) both;
	}

	@keyframes era-slide-in {
		from {
			transform: scaleX(0);
			opacity: 0;
		}
		to {
			transform: scaleX(1);
			opacity: 1;
		}
	}

	/* ── Label fade-in ──────────────────────────────────────────────────────── */
	.era-label {
		opacity: 0;
	}

	.era-label.animate {
		animation: era-fade-in 0.35s ease-out both;
	}

	@keyframes era-fade-in {
		from {
			opacity: 0;
			translate: 0 3px;
		}
		to {
			opacity: 1;
			translate: 0 0;
		}
	}

	/* Respect reduced-motion preference */
	@media (prefers-reduced-motion: reduce) {
		.era-bar,
		.era-label {
			animation: none !important;
			transform: none !important;
			opacity: 1 !important;
		}
	}
</style>
