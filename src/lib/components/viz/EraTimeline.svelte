<script lang="ts">
	import type { EraData } from '$lib/types/explainer';

	interface Props {
		eras: EraData[];
		title?: string;
	}

	let { eras, title }: Props = $props();

	// ── SVG coordinate space ──────────────────────────────────────────────────
	const SVG_W = 480;
	const PAD_L = 16;
	const PAD_R = 24; // extra room for arrowhead on ongoing eras
	const CHART_W = SVG_W - PAD_L - PAD_R;

	// Time domain
	const YEAR_MIN = 1840;
	const YEAR_MAX = 2040;
	const YEAR_RANGE = YEAR_MAX - YEAR_MIN;

	// Row geometry
	const BAR_H = 42;
	const ROW_STRIDE = 76; // distance between row tops (bar + keyword + gap)
	const FIRST_ROW_Y = 28; // top of first bar (leaves room for year label above)

	const SVG_H = $derived(FIRST_ROW_Y + eras.length * ROW_STRIDE + 4);

	function toX(year: number): number {
		return PAD_L + ((year - YEAR_MIN) / YEAR_RANGE) * CHART_W;
	}

	function barY(index: number): number {
		return FIRST_ROW_Y + index * ROW_STRIDE;
	}

	// Arrowhead polygon points for ongoing eras (right-pointing triangle)
	function arrowPoints(x: number, midY: number): string {
		const tip = x + 14;
		const half = 10;
		return `${x},${midY - half} ${tip},${midY} ${x},${midY + half}`;
	}
</script>

<div class="w-full select-none">
	{#if title}
		<p class="mb-3 text-[10px] font-semibold uppercase tracking-widest opacity-40">{title}</p>
	{/if}

	<svg
		viewBox="0 0 {SVG_W} {SVG_H}"
		class="w-full overflow-visible"
		role="img"
		aria-label="Three eras of medicine timeline"
	>
		{#each eras as era, i}
			{@const x0 = toX(era.startYear)}
			{@const x1 = era.endYear ? toX(era.endYear) : SVG_W - PAD_R - 2}
			{@const bw = x1 - x0}
			{@const by = barY(i)}
			{@const midY = by + BAR_H / 2}

			<!-- Year label above bar start -->
			<text
				x={x0}
				y={by - 7}
				fill="currentColor"
				fill-opacity="0.45"
				font-size="10"
				font-family="inherit"
				text-anchor="start"
			>{era.startYear}</text>

			<!-- Coloured era bar -->
			<rect
				x={x0}
				y={by}
				width={bw}
				height={BAR_H}
				rx="6"
				fill={era.color}
				opacity="0.92"
			/>

			<!-- Ongoing arrow cap (replaces the right edge of the bar with a pointy end) -->
			{#if !era.endYear}
				<!-- Clip the right edge of the rect so the arrow cap replaces it cleanly -->
				<polygon
					points={arrowPoints(x1, midY)}
					fill={era.color}
					opacity="0.92"
				/>
				<!-- Small "ongoing" year label near arrow tip -->
				<text
					x={x1 + 18}
					y={midY + 1}
					fill="currentColor"
					fill-opacity="0.4"
					font-size="9.5"
					font-family="inherit"
					dominant-baseline="middle"
				>now</text>
			{:else}
				<!-- End-year label -->
				<text
					x={x1}
					y={by - 7}
					fill="currentColor"
					fill-opacity="0.35"
					font-size="10"
					font-family="inherit"
					text-anchor="end"
				>{era.endYear}s</text>
			{/if}

			<!-- Era title inside the bar -->
			<text
				x={x0 + 11}
				y={midY}
				fill="white"
				font-size="12"
				font-weight="600"
				font-family="inherit"
				dominant-baseline="middle"
				clip-path="url(#clip-era-{i})"
			>{era.title}</text>

			<!-- Clip region matching the bar so long titles don't overflow -->
			<clipPath id="clip-era-{i}">
				<rect x={x0} y={by} width={bw - 4} height={BAR_H} />
			</clipPath>

			<!-- Keyword subtitle below bar -->
			<text
				x={x0 + 2}
				y={by + BAR_H + 13}
				fill="currentColor"
				fill-opacity="0.42"
				font-size="9.5"
				font-family="inherit"
			>{era.keyword}</text>
		{/each}
	</svg>
</div>
