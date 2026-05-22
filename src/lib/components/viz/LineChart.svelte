<script lang="ts">
	/**
	 * <LineChart> — animated line chart with path draw-on-scroll.
	 *
	 * stroke-dashoffset driven by stepProgress for draw-in effect.
	 * Multiple series; step changes switch between them.
	 */
	import * as d3 from 'd3';
	import ChartContainer from './ChartContainer.svelte';
	import { CHART_W, CHART_H } from './chart-constants';

	interface DataPoint { year: number; value: number; }
	interface Series { name: string; color: string; data: DataPoint[]; }

	interface Props {
		stepProgress?: number;
		activeStep?: number;
		series?: Series[];
		label?: string;
	}

	let { stepProgress = 0, activeStep = 0, series = [], label = 'Line chart' }: Props = $props();

	const margin = { top: 50, right: 60, bottom: 60, left: 60 };
	const innerWidth = CHART_W - margin.left - margin.right;
	const innerHeight = CHART_H - margin.top - margin.bottom;

	const xScale = d3.scaleLinear().domain([1980, 2024]).range([0, innerWidth]);
	let yScale = $derived(
		d3.scaleLinear()
			.domain([0, d3.max(series.flatMap((s) => s.data.map((d) => d.value))) ?? 80])
			.range([innerHeight, 0])
	);

	const lineGen = d3.line<DataPoint>()
		.x((d) => xScale(d.year))
		.y((d) => yScale(d.value))
		.curve(d3.curveCatmullRom.alpha(0.5));

	let activeSeries = $derived(series[activeStep % series.length] ?? series[0]);
	let dashOffset = $derived((1 - stepProgress) * 2000);

	let prefersReducedMotion = $derived(
		typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
	);
</script>

<ChartContainer {label}>
	<text x={CHART_W / 2} y={30} text-anchor="middle" class="fill-ink font-display text-lg font-bold">
		{activeSeries?.name ?? 'UPF Consumption Over Time'}
	</text>

	<g transform="translate({margin.left}, {margin.top})">
		{#each yScale.ticks(5) as tick (tick)}
			<line x1={0} x2={innerWidth} y1={yScale(tick)} y2={yScale(tick)} class="stroke-ink/[0.1]" stroke-dasharray="4,4" />
			<text x={-10} y={yScale(tick)} text-anchor="end" dominant-baseline="middle" class="fill-ink/50 font-body text-xs">{tick}%</text>
		{/each}

		{#each [1980, 1990, 2000, 2010, 2020, 2024] as year (year)}
			<text x={xScale(year)} y={innerHeight + 24} text-anchor="middle" class="fill-ink/50 font-body text-xs">{year}</text>
		{/each}

		{#if activeSeries}
			{@const pathD = lineGen(activeSeries.data) ?? ''}
			<path
				d={pathD}
				fill="none"
				stroke={activeSeries.color}
				stroke-width="3"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-dasharray={prefersReducedMotion ? 'none' : 2000}
				stroke-dashoffset={prefersReducedMotion ? 0 : dashOffset}
				class="transition-none"
			/>
			{#each activeSeries.data as pt (pt.year)}
				<circle cx={xScale(pt.year)} cy={yScale(pt.value)} r={4} fill={activeSeries.color} />
				{#if stepProgress > 0.5 || prefersReducedMotion}
					<text x={xScale(pt.year)} y={yScale(pt.value) - 14} text-anchor="middle" class="line-label fill-ink font-body text-xs font-semibold">{pt.value}%</text>
				{/if}
			{/each}
		{/if}
	</g>
</ChartContainer>

<style>
	.line-label {
		paint-order: stroke;
		stroke: #fef9ef;
		stroke-width: 4px;
		stroke-linejoin: round;
	}
</style>
