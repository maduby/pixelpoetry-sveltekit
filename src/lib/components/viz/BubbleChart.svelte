<script lang="ts">
	/**
	 * <BubbleChart> — animated bubble/scatter chart driven by scroll progress.
	 *
	 * Bubbles appear and scale in as stepProgress goes 0→1.
	 */
	import * as d3 from 'd3';
	import ChartContainer from './ChartContainer.svelte';
	import { CHART_W, CHART_H } from './chart-constants';

	interface DataPoint {
		label: string;
		value: number;
		category: string;
	}

	interface Props {
		stepProgress?: number;
		data?: DataPoint[];
		label?: string;
	}

	let { stepProgress = 0, data = [], label = 'Bubble chart' }: Props = $props();

	const margin = { top: 40, right: 40, bottom: 40, left: 40 };
	const innerW = CHART_W - margin.left - margin.right;
	const innerH = CHART_H - margin.top - margin.bottom;

	const categoryColors: Record<string, string> = {
		red: '#c0392b', amber: '#d4a017', pink: '#e8839a',
		ink: '#0a0a0a', default: '#6c5ce7'
	};

	let rScale = $derived(
		d3.scaleSqrt()
			.domain([0, d3.max(data, (d) => d.value) ?? 100])
			.range([8, 55])
	);

	// Curated bubble positions proportional to CHART_W × CHART_H
	const positions: Array<{ x: number; y: number }> = [
		{ x: innerW * 0.27, y: innerH * 0.37 },
		{ x: innerW * 0.52, y: innerH * 0.28 },
		{ x: innerW * 0.76, y: innerH * 0.42 },
		{ x: innerW * 0.20, y: innerH * 0.70 },
		{ x: innerW * 0.45, y: innerH * 0.63 },
		{ x: innerW * 0.68, y: innerH * 0.68 },
		{ x: innerW * 0.88, y: innerH * 0.57 },
		{ x: innerW * 0.35, y: innerH * 0.87 },
		{ x: innerW * 0.82, y: innerH * 0.82 },
	];

	let prefersReducedMotion = $derived(
		typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
	);
</script>

<ChartContainer {label}>
	<text x={CHART_W / 2} y={28} text-anchor="middle" class="fill-ink font-display text-lg font-bold">
		UPF % of diet by country
	</text>

	<g transform="translate({margin.left}, {margin.top})">
		{#each data as d, i (d.label)}
			{@const bx = positions[i]?.x ?? (i * 80) + 60}
			{@const by = positions[i]?.y ?? 150 + (i % 3) * 80}
			{@const color = categoryColors[d.category] ?? categoryColors.default}
			{@const r = prefersReducedMotion ? rScale(d.value) : rScale(d.value) * stepProgress}
			{@const opacity = prefersReducedMotion ? 0.85 : Math.min(1, stepProgress * 2)}

			<circle cx={bx} cy={by} {r} fill={color} opacity={opacity * 0.85} />

			{#if stepProgress > 0.4 || prefersReducedMotion}
				<text x={bx} y={by - r - 6} text-anchor="middle" class="fill-ink font-body text-xs font-semibold" opacity={opacity}>{d.label}</text>
				<text x={bx} y={by + 4} text-anchor="middle" class="fill-white font-body text-xs font-bold" opacity={opacity}>{d.value}%</text>
			{/if}
		{/each}
	</g>
</ChartContainer>