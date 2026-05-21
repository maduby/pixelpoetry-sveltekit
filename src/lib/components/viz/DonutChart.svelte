<script lang="ts">
	/**
	 * <DonutChart> — bold standalone donut chart with a readable stacked legend.
	 *
	 * The legend is rendered as HTML (not SVG text) so it wraps cleanly and
	 * never collides regardless of label length.
	 *
	 * Animation: an expanding clip-path sweeps the arcs into view from 12 o'clock
	 * clockwise when the chart enters the viewport. The centre number counts up in
	 * sync. Respects prefers-reduced-motion.
	 */
	import * as d3 from 'd3';
	import { onMount } from 'svelte';

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

	// ── SVG geometry ────────────────────────────────────────────────────────────
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

	// ── Unique clip-path ID (stable per instance) ────────────────────────────
	// Using a module-level counter avoids the need for crypto / Math.random on
	// SSR where window is unavailable, and guarantees uniqueness per component.
	let clipId = `donut-reveal-${Math.random().toString(36).slice(2, 8)}`;

	// ── Animation state ─────────────────────────────────────────────────────────
	let progress = $state(0); // 0 → 1
	let svgEl = $state<SVGSVGElement | undefined>(undefined);

	/**
	 * Build an SVG pie-slice clip path from the 12 o'clock position sweeping
	 * clockwise to `p * 360°`. Uses D3 angle convention: angle 0 = top, clockwise.
	 *   D3 angle θ → SVG: x = sin(θ) * r,  y = -cos(θ) * r
	 */
	function sweepClip(p: number): string {
		if (p <= 0) return 'M 0 0'; // empty — nothing visible
		const R = outerR + 20; // slightly larger than the arcs
		if (p >= 1) {
			// Full coverage: return a rectangle big enough to cover everything
			return `M ${-R} ${-R} H ${R} V ${R} H ${-R} Z`;
		}
		const angle = p * Math.PI * 2;
		const x2 = Math.sin(angle) * R;
		const y2 = -Math.cos(angle) * R;
		const largeArc = p > 0.5 ? 1 : 0;
		// Pie wedge from centre: M 0,0 → 12 o'clock → arc → back to centre
		return `M 0 0 L 0 ${-R} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} Z`;
	}

	// Ease-out cubic — feels natural for a "reveal" motion
	function easeOut(t: number): number {
		return 1 - Math.pow(1 - t, 3);
	}

	const DURATION = 900; // ms

	onMount(() => {
		const prefersReducedMotion =
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (prefersReducedMotion) {
			progress = 1;
			return;
		}

		const io = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				io.disconnect();

				const start = performance.now();
				function tick(now: number) {
					const t = Math.min((now - start) / DURATION, 1);
					progress = easeOut(t);
					if (t < 1) requestAnimationFrame(tick);
				}
				requestAnimationFrame(tick);
			},
			{ threshold: 0.3 }
		);
		if (svgEl) io.observe(svgEl);
		return () => io.disconnect();
	});

	// Centre display value counts up with the animation
	let displayValue = $derived(Math.round(progress * heroValue));
</script>

<div class="mx-auto flex h-full w-full max-w-sm flex-col items-center gap-5 py-6">
	<!-- Donut arc -->
	<svg
		bind:this={svgEl}
		viewBox="0 0 {W} {H}"
		role="img"
		aria-label={label}
		class="w-full"
	>
		<defs>
			<!-- Clip path sweeps clockwise from 12 o'clock as progress → 1 -->
			<clipPath id={clipId}>
				<path d={sweepClip(progress)} />
			</clipPath>
		</defs>

		<g transform="translate({cx}, {cy})">
			<!-- Arcs are clipped by the expanding wedge -->
			<g clip-path="url(#{clipId})">
				{#each arcs as arc (arc.data.label)}
					<path
						d={arcGen(arc) ?? ''}
						fill={arc.data.color}
						class="drop-shadow-sm"
					/>
				{/each}
			</g>

			<!-- Centre hero number — not clipped, fades in alongside the sweep.
			     dy="0.35em" gives optical vertical centering for bold numerals. -->
			<text
				text-anchor="middle"
				y={0}
				dy="0.35em"
				style="font-family: 'Arvo', serif; font-size: 80px; font-weight: 700; fill: #0a0a0a; letter-spacing: -2px; line-height: 1; opacity: {progress};"
			>
				{displayValue}%
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
