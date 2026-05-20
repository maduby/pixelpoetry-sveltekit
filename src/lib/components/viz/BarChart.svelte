<script lang="ts">
	/**
	 * <BarChart> — responsive horizontal bar chart with bars growing from baseline on scroll.
	 *
	 * - Uses ChartContainer's reactive width so bars always fill the container.
	 * - stepProgress (0→1) drives bar width growth from 0 to full value.
	 * - Optional yearStart/yearEnd props add a "1980 → 2024" header showing
	 *   time-context so the scroll animation conveys how drastically things changed.
	 */
	import * as d3 from 'd3';
	import ChartContainer from './ChartContainer.svelte';
	import { CHART_W } from './chart-constants';

	interface DataPoint {
		label: string;
		value: number;
		category?: string;
		/** Optional year for time-series bars — used to render year header */
		year?: number;
	}

	interface Props {
		stepProgress?: number;
		data?: DataPoint[];
		label?: string;
		/** Start year for the time range (e.g. 1980) */
		yearStart?: number;
		/** End year for the time range (e.g. 2024) */
		yearEnd?: number;
	}

	let {
		stepProgress = 0,
		data = [],
		label = 'Bar chart',
		yearStart,
		yearEnd
	}: Props = $props();

	const height = 420;
	const margin = { top: 50, right: 40, bottom: 40, left: 160 };

	// Internal SVG coordinate space matches ChartContainer's fixed 800×500 viewBox.
	const svgWidth = CHART_W;
	let innerWidth = $derived(svgWidth - margin.left - margin.right);
	let innerHeight = $derived(height - margin.top - margin.bottom);
	let barHeight = $derived(Math.min(36, (innerHeight / (data.length || 1)) - 8));

	let prefersReducedMotion = $derived(
		typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
	);

	// X scale — domain always [0, maxValue]; range tracks innerWidth reactively
	let xScale = $derived(
		d3.scaleLinear()
			.domain([0, d3.max(data, (d) => d.value) ?? 100])
			.range([0, innerWidth])
	);

	// Y scale — recomputes when data or innerHeight changes
	let yScale = $derived(
		d3.scaleBand()
			.domain(data.map((d) => d.label))
			.range([0, innerHeight])
			.padding(0.3)
	);

	const categoryColors: Record<string, string> = {
		red: '#c0392b', amber: '#d4a017', pink: '#e8839a', ink: '#0a0a0a'
	};

	let maxValue = $derived(d3.max(data, (d) => d.value) ?? 100);
	let hasYears = $derived(yearStart != null && yearEnd != null);
</script>

<ChartContainer {label}>
	<!-- Chart title — shows the end-year value or just the max -->
	<text x={CHART_W / 2} y={28} text-anchor="middle" class="fill-ink font-display text-base font-bold" dominant-baseline="middle">
		{maxValue}% {hasYears ? `— ${yearEnd}` : ''}
	</text>

	<!-- Time range label for year-based data -->
	{#if hasYears}
		<text x={CHART_W / 2} y={46} text-anchor="middle" class="fill-ink/50 font-body text-xs tracking-widest uppercase" dominant-baseline="middle">
			{yearStart} → {yearEnd}
		</text>
	{/if}

	<g transform="translate({margin.left}, {margin.top})">
		<!-- Grid lines -->
		{#each xScale.ticks(4) as tick (tick)}
			<line x1={xScale(tick)} x2={xScale(tick)} y1={0} y2={innerHeight} class="stroke-ink/[0.08]" />
		{/each}

		{#each data as d, i (d.year ?? d.label)}
			{@const bw = xScale(d.value) * (prefersReducedMotion ? 1 : stepProgress)}
			{@const by = yScale(d.label) ?? 0}
			{@const color = categoryColors[d.category ?? (i === 0 ? 'red' : i === 1 ? 'amber' : i === 2 ? 'pink' : 'ink')] ?? '#0a0a0a'}

			<!-- Track / background bar -->
			<rect x={0} y={by} width={innerWidth} height={barHeight} class="fill-ink/[0.05]" rx="3" />

			<!-- Filled bar growing from left (baseline) -->
			<rect x={0} y={by} width={bw} height={barHeight} fill={color} rx="3" class="transition-none" />

			<!-- Label — left of bar -->
			<text
				x={-10}
				y={by + barHeight / 2}
				text-anchor="end"
				dominant-baseline="middle"
				class="fill-ink font-body text-sm font-semibold"
			>
				{d.year ? `${d.year}` : d.label}
			</text>

			<!-- Value label — appears once bar has grown enough -->
			{#if (stepProgress > 0.4 || prefersReducedMotion) && bw > 30}
				<text
					x={bw + 8}
					y={by + barHeight / 2}
					dominant-baseline="middle"
					class="fill-ink font-body text-sm font-bold"
				>
					{d.value}%
				</text>
			{/if}
		{/each}
	</g>
</ChartContainer>