<script lang="ts">
	/**
	 * <ObsTimelineChart> — multi-series line chart powered by Observable Plot.
	 *
	 * Built for the "UPF over time" story: each series is one country and
	 * one or more (year, value) points. Renders a clean Plot.lineY chart
	 * with country labels positioned at the right edge of each line so
	 * legends are inline with the data rather than detached.
	 *
	 * Single chart, single Plot.plot() call. The wrapper measures its own
	 * width with ResizeObserver and re-renders on resize.
	 */
	import { browser } from '$app/environment';
	import { getActiveExplainer } from '$lib/context/explainer.svelte';
	import { openSourceSheet } from '$lib/context/sheet';
	import type { TimelineSeries } from '$lib/types/explainer';

	const explainer = $derived(getActiveExplainer());

	interface Props {
		series?: TimelineSeries[];
		title?: string;
		subtitle?: string;
		unit?: string;
		domain?: [number, number];
		valueDomain?: [number, number];
		sourceId?: string;
	}

	let {
		series = [],
		title,
		subtitle,
		unit = '%',
		domain,
		valueDomain,
		sourceId
	}: Props = $props();

	const source = $derived(sourceId ? explainer?.getSource(sourceId) : undefined);

	let wrapperEl = $state<HTMLDivElement | undefined>(undefined);
	let containerEl = $state<HTMLDivElement | undefined>(undefined);

	let measuredWidth = $state(560);
	let chartWidth = $derived(Math.max(320, measuredWidth));
	/** Height of the nearest sticky viz column. 0 = not inside one (renders inline). */
	let availableHeight = $state(0);

	const MOBILE_BREAKPOINT = 540;
	let isNarrow = $derived(measuredWidth > 0 && measuredWidth < MOBILE_BREAKPOINT);

	/**
	 * Responsive chart height: fill ~65% of the sticky column height when
	 * available, clamped between a comfortable minimum and a readable maximum.
	 * Falls back to fixed 260/340 when rendered inline (no sticky ancestor).
	 */
	const chartH = $derived(
		availableHeight > 0
			? Math.min(Math.max(isNarrow ? 200 : 240, Math.round(availableHeight * 0.65)), isNarrow ? 320 : 440)
			: (isNarrow ? 260 : 340)
	);

	// Flatten series into one row per point with the series label attached
	// so a single Plot.lineY call can colour and connect them by series.
	const flatData = $derived(
		series.flatMap((s) =>
			s.points.map((p) => ({ label: s.label, color: s.color, year: p.year, value: p.value }))
		)
	);

	// Latest data point for each series — drives the legend values.
	const endpoints = $derived(
		series
			.map((s) => {
				const last = s.points[s.points.length - 1];
				return last ? { label: s.label, color: s.color, year: last.year, value: last.value } : null;
			})
			.filter((d): d is { label: string; color: string; year: number; value: number } => !!d)
	);

	/**
	 * Highlight one series in the chart by dimming the others.
	 * Works by querying the rendered SVG for path/circle elements and
	 * comparing their stroke/fill attributes against the series colour.
	 * Pass null to reset all elements to full opacity.
	 */
	function highlightSeries(label: string | null) {
		const svgEl = containerEl?.querySelector('svg');
		if (!svgEl) return;
		const lines = svgEl.querySelectorAll<SVGPathElement>('g[aria-label="line"] path');
		const dots = svgEl.querySelectorAll<SVGCircleElement>('g[aria-label="dot"] circle');
		if (!label) {
			[...lines, ...dots].forEach((el) => {
				el.style.opacity = '';
				el.style.transition = 'opacity 180ms ease';
			});
			return;
		}
		const targetColor = series.find((s) => s.label === label)?.color?.toLowerCase();
		lines.forEach((path) => {
			const match = path.getAttribute('stroke')?.toLowerCase() === targetColor;
			path.style.opacity = match ? '1' : '0.08';
			path.style.transition = 'opacity 180ms ease';
		});
		dots.forEach((circle) => {
			const match = circle.getAttribute('fill')?.toLowerCase() === targetColor;
			circle.style.opacity = match ? '1' : '0.08';
			circle.style.transition = 'opacity 180ms ease';
		});
	}

	const xDomain = $derived<[number, number]>(
		domain ?? [
			Math.min(...flatData.map((d) => d.year)) - 1,
			Math.max(...flatData.map((d) => d.year)) + 1
		]
	);
	const yDomain = $derived<[number, number]>(
		valueDomain ?? [0, Math.max(...flatData.map((d) => d.value), 10) * 1.15]
	);

	const prefersReducedMotion =
		typeof window !== 'undefined' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/**
	 * Gentle fade-in for the data dots on first viewport entry. We do NOT
	 * touch text elements here — querying `svg text` blindly would also
	 * match the Plot.tip group's text nodes and keep them permanently
	 * invisible. Country labels and value pills render immediately.
	 */
	function setupAnimation(container: HTMLElement) {
		if (prefersReducedMotion) return;

		// Only animate the dot mark — scoped via its aria-label group so
		// we never accidentally hide tip/pointer or axis elements.
		const circles = Array.from(
			container.querySelectorAll<SVGCircleElement>('svg g[aria-label="dot"] circle')
		);
		if (!circles.length) return;

		circles.forEach((c) => (c.style.opacity = '0'));

		const animate = () => {
			circles.forEach((c) => {
				c.style.transition = 'opacity 240ms ease-out';
				c.style.opacity = '1';
			});
		};

		const io = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					requestAnimationFrame(() => requestAnimationFrame(animate));
					io.disconnect();
				}
			},
			{ threshold: 0.15 }
		);
		io.observe(container);

		// Safety: reveal anyway after 600ms if the IO never fires
		// (e.g. element mounted already past the viewport).
		setTimeout(() => {
			if (circles[0]?.style.opacity === '0') animate();
		}, 600);
	}

	$effect(() => {
		if (!browser || !containerEl) return;

		// Reactivity anchors — read up front so the effect re-runs when any change.
		const _w = chartWidth;
		const _narrow = isNarrow;
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		availableHeight;
			const _flat = flatData;
			const _xd = xDomain;
			const _yd = yDomain;

		let cancelled = false;
		containerEl.innerHTML = '';

		(async () => {
			const Plot = await import('@observablehq/plot');
			if (cancelled || !containerEl) return;

			const fontPx = _narrow ? 11 : 13;
			// No inside labels → only a tiny right margin for the final axis tick.
			const marginRight = _narrow ? 10 : 12;

			const chart = Plot.plot({
				width: _w,
				height: chartH,
				marginLeft: _narrow ? 36 : 48,
				marginRight,
				marginTop: 16,
				marginBottom: 36,
				style: {
					background: 'transparent',
					fontFamily: '"Lato", system-ui, sans-serif',
					color: '#0a0a0a',
					overflow: 'visible',
					fontSize: `${fontPx}px`
				},
				x: {
					label: null,
					domain: _xd,
					tickFormat: (d: number) => `${d}`,
					tickPadding: 6,
					grid: false
				},
				y: {
					label: null,
					domain: _yd,
					tickFormat: (d: number) => `${d}${unit}`,
					tickPadding: 6,
					grid: true,
					ticks: 5
				},
				marks: [
					Plot.ruleY([0], { stroke: '#0a0a0a30' }),
					// Connect each country's data points with a thin coloured line.
					// `(d) => d.color` is the function form so Plot uses the literal
					// hex value rather than passing it through an auto color scale.
					Plot.line(_flat, {
						x: 'year',
						y: 'value',
						stroke: (d: { color: string }) => d.color,
						z: 'label',
						strokeWidth: _narrow ? 1.25 : 1.5,
						strokeOpacity: 0.85,
						strokeLinecap: 'round',
						strokeLinejoin: 'round',
						curve: 'linear'
					}),
					Plot.dot(_flat, {
						x: 'year',
						y: 'value',
						fill: (d: { color: string }) => d.color,
						stroke: '#fef9ef',
						strokeWidth: 1.6,
						r: _narrow ? 3.5 : 4.5
					}),
					// Tooltip LAST — SVG paint order means last = on top, so the
					// tip box always renders above country labels and value pills.
					Plot.tip(
						_flat,
						Plot.pointer({
							x: 'year',
							y: 'value',
						title: (d: { label: string; year: number; value: number }) =>
							`${d.label}\n${d.year}: ${d.value}${unit}`
						})
					)
				]
			});

			containerEl.appendChild(chart);
			setupAnimation(containerEl);
		})();

		return () => {
			cancelled = true;
		};
	});

	$effect(() => {
		if (!wrapperEl) return;
		const ro = new ResizeObserver((entries) => {
			const w = entries[0]?.contentRect.width ?? 0;
			if (w > 0) measuredWidth = Math.round(w);
		});
		ro.observe(wrapperEl);
		return () => ro.disconnect();
	});

	// Observe the nearest sticky viz column so we can size the chart height
	// to fill the available viewport slot rather than using a fixed px value.
	$effect(() => {
		if (!browser || !wrapperEl) return;
		const stickyAncestor = wrapperEl.closest<HTMLElement>('[data-viz-sticky]');
		if (!stickyAncestor) {
			availableHeight = 0;
			return;
		}
		const ro = new ResizeObserver(([e]) => {
			availableHeight = e.contentRect.height || 0;
		});
		ro.observe(stickyAncestor);
		return () => ro.disconnect();
	});
</script>

<div bind:this={wrapperEl} class="w-full">
	{#if title}
		<h3 class="font-display text-xl font-black leading-tight text-ink md:text-2xl">{title}</h3>
	{/if}
	{#if subtitle}
		<p class="mt-1 font-body text-sm text-ink/60">{subtitle}</p>
	{/if}

	<div
		bind:this={containerEl}
		class="tip-host mt-4 w-full overflow-visible [&_svg]:max-w-full!"
		aria-label={title ?? 'Timeline chart'}
	></div>

	<!-- ── Series legend ── colored dot · label · latest value ── -->
	{#if series.length > 0}
		<div class="mt-4 flex flex-wrap gap-x-5 gap-y-2">
			{#each endpoints as ep}
				<button
					type="button"
					class="group flex cursor-pointer items-center gap-2"
					onmouseenter={() => highlightSeries(ep.label)}
					onmouseleave={() => highlightSeries(null)}
					onfocus={() => highlightSeries(ep.label)}
					onblur={() => highlightSeries(null)}
					aria-label="Highlight {ep.label}"
				>
					<span
						class="h-2.5 w-2.5 shrink-0 rounded-full transition-transform group-hover:scale-125"
						style="background-color:{ep.color}"
					></span>
					<span class="font-body text-sm font-medium text-ink/60 transition-colors group-hover:text-ink"
						>{ep.label}</span
					>
					<span class="font-body text-sm font-bold" style="color:{ep.color}"
						>{ep.value}{unit}</span
					>
				</button>
			{/each}
		</div>
	{/if}

	{#if source}
		<button
			type="button"
			onclick={() => openSourceSheet(source.id)}
			class="group mt-3 flex cursor-pointer items-center gap-1 text-xs font-semibold text-ink/40 transition-colors hover:text-brand-red"
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
			><path d="M2 10 L10 2 M4 2 H10 V8" /></svg>
		</button>
	{/if}
</div>

<style>
	/* Force the Observable Plot tooltip to always render on top and remain
	   fully legible regardless of what other SVG marks paint beneath it. */
	.tip-host :global(svg g[aria-label='tip'] rect),
	.tip-host :global(svg g[aria-label='tip'] path) {
		fill: #ffffff;
		stroke: #0a0a0a20;
		filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.18));
	}

	.tip-host :global(svg g[aria-label='tip'] text) {
		fill: #0a0a0a !important;
		font-weight: 600;
	}

	/* Keep label text non-interactive so hover still reaches the dots
	   even when a country label visually overlaps a data point. */
	.tip-host :global(svg g[aria-label='text']) {
		pointer-events: none;
	}
</style>
