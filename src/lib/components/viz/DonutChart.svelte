<script lang="ts">
	/**
	 * <DonutChart> — bold standalone donut chart, no scroll animation.
	 *
	 * Built with pure D3 arc math (no ChartContainer wrapper) so it fills the
	 * full viz column and looks editorial rather than dashboard-like.
	 *
	 * Designed for the 80 % UPF / 20 % whole foods beat but works for any
	 * small number of slices.
	 */
	import * as d3 from 'd3';

	interface DataPoint {
		label: string;
		value: number;
		color: string;
	}

	interface Props {
		data?: DataPoint[];
		label?: string;
	}

	let { data = [], label = 'Donut chart' }: Props = $props();

	// SVG coordinate space
	const W = 480;
	const H = 520;
	const cx = W / 2;
	const cy = H / 2 - 16; // shifted up a little to leave room for legend
	const outerR = 200;
	const innerR = 118;

	const pie = d3
		.pie<DataPoint>()
		.value((d) => d.value)
		.sort(null)
		.padAngle(0.025);

	const arcGen = d3
		.arc<d3.PieArcDatum<DataPoint>>()
		.innerRadius(innerR)
		.outerRadius(outerR)
		.cornerRadius(6);

	// Arcs derived reactively from data
	let arcs = $derived(data.length > 0 ? pie(data) : []);

	// The "hero" number = value of the first (largest) slice
	let heroValue = $derived(data[0]?.value ?? 0);
	let heroLabel = $derived(data[0]?.label ?? '');
</script>

<div class="mx-auto flex h-full w-full max-w-md items-center justify-center py-6">
	<svg
		viewBox="0 0 {W} {H}"
		role="img"
		aria-label={label}
		class="w-full"
		style="max-height: 520px"
	>
		<!-- Arcs -->
		<g transform="translate({cx}, {cy})">
			{#each arcs as arc (arc.data.label)}
				<path
					d={arcGen(arc) ?? ''}
					fill={arc.data.color}
					class="drop-shadow-sm"
				/>
			{/each}

			<!-- Centre hero number -->
			<text
				text-anchor="middle"
				dominant-baseline="middle"
				y={-18}
				style="font-family: 'Arvo', serif; font-size: 76px; font-weight: 700; fill: #0a0a0a; letter-spacing: -2px"
			>
				{heroValue}%
			</text>
			<text
				text-anchor="middle"
				y={40}
				style="font-family: 'Lato', sans-serif; font-size: 15px; fill: #0a0a0a80; font-weight: 400; text-transform: uppercase; letter-spacing: 1.5px"
			>
				{heroLabel.toLowerCase()}
			</text>
		</g>

		<!-- Legend -->
		<g transform="translate({cx}, {H - 32})">
			{#each data as d, i (d.label)}
				{@const xOff = i === 0 ? -140 : 36}
				<rect x={xOff} y={-9} width={12} height={12} fill={d.color} rx="2" />
				<text
					x={xOff + 18}
					dominant-baseline="middle"
					style="font-family: 'Lato', sans-serif; font-size: 13px; fill: #0a0a0a; font-weight: 600"
				>
					{d.value}% {d.label}
				</text>
			{/each}
		</g>
	</svg>
</div>
