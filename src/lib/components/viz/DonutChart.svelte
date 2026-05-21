<script lang="ts">
	/**
	 * <DonutChart> — bold standalone donut chart with a readable stacked legend.
	 *
	 * The legend is rendered as HTML (not SVG text) so it wraps cleanly and
	 * never collides regardless of label length.
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

	const W = 480;
	const H = 480;
	const cx = W / 2;
	const cy = H / 2;
	const outerR = 210;
	const innerR = 124;

	const pie = d3
		.pie<DataPoint>()
		.value((d) => d.value)
		.sort(null)
		.padAngle(0.028);

	const arcGen = d3
		.arc<d3.PieArcDatum<DataPoint>>()
		.innerRadius(innerR)
		.outerRadius(outerR)
		.cornerRadius(6);

	let arcs = $derived(data.length > 0 ? pie(data) : []);

	let heroValue = $derived(data[0]?.value ?? 0);
</script>

<div class="mx-auto flex h-full w-full max-w-sm flex-col items-center gap-5 py-6">
	<!-- Donut arc -->
	<svg
		viewBox="0 0 {W} {H}"
		role="img"
		aria-label={label}
		class="w-full"
	>
		<g transform="translate({cx}, {cy})">
			{#each arcs as arc (arc.data.label)}
				<path
					d={arcGen(arc) ?? ''}
					fill={arc.data.color}
					class="drop-shadow-sm"
				/>
			{/each}

			<!-- Centre hero number.
			     dy="0.35em" is the SVG-standard trick for optically centering
			     bold numerals: it shifts the text down by 35% of the em so the
			     visual mid-point of the digits lands exactly on y=0.
			     dominant-baseline="middle" is intentionally omitted — it aligns
			     the mathematical midpoint, not the optical one, and makes bold
			     numbers look too high. -->
			<text
				text-anchor="middle"
				y={0}
				dy="0.35em"
				style="font-family: 'Arvo', serif; font-size: 80px; font-weight: 700; fill: #0a0a0a; letter-spacing: -2px; line-height: 1;"
			>
				{heroValue}%
			</text>
		</g>
	</svg>

	<!-- Legend — HTML so it wraps and never collides -->
	<dl class="flex w-full flex-col gap-2 px-2">
		{#each data as d (d.label)}
			<div class="flex items-start gap-3">
				<span
					class="mt-[3px] h-3 w-3 shrink-0 rounded-sm"
					style="background-color: {d.color}"
					aria-hidden="true"
				></span>
				<dd class="font-body text-sm font-semibold leading-snug text-ink/80">
					<span class="font-black text-ink">{d.value}%</span>
					{d.label}
				</dd>
			</div>
		{/each}
	</dl>
</div>
