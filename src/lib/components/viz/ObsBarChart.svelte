<script lang="ts">
	/**
	 * <ObsBarChart> — bold, static horizontal bar chart powered by Observable Plot.
	 *
	 * Two layout modes, picked from the container's measured width:
	 *
	 *  Desktop (width ≥ MOBILE_BREAKPOINT):
	 *    Standard horizontal bars. Each row carries its label on the LEFT
	 *    as a y-axis tick. Generous `marginLeft` accommodates the longest
	 *    label.
	 *
	 *  Mobile (width < MOBILE_BREAKPOINT):
	 *    Labels are hoisted ABOVE each bar as full-width HTML headings.
	 *    Every bar then renders as a one-row mini-chart with `marginLeft:
	 *    0`, so the full container width is given to the bar instead of
	 *    being eaten by the y-axis. This is critical for long labels
	 *    ("Labelling / food environment only", "Deprived areas (UK)",
	 *    "Sausages / reconstituted meat" …) that would otherwise compress
	 *    the bars to a sliver on a 360px phone.
	 *
	 * Simple mode  — data = [{label, value}]      → one bar per label.
	 * Grouped mode — data = [{label, value, group}] → bars grouped by
	 *                `label`; `group` is the per-bar caption inside each
	 *                section.
	 *
	 * No scroll animation; renders once and responds to container resize.
	 */
	import { browser } from '$app/environment';
	import { getActiveExplainer } from '$lib/context/explainer.svelte';
	import { openSourceSheet } from '$lib/context/sheet';

	const explainer = $derived(getActiveExplainer());

	import type { ObsBarDataPoint } from '$lib/types/explainer';

	interface Props {
		data?: ObsBarDataPoint[];
		title?: string;
		subtitle?: string;
		unit?: string;
		prefix?: string;
		maxValue?: number;
		sourceId?: string;
	}

	let { data = [], title, subtitle, unit = '%', prefix = '', maxValue, sourceId }: Props = $props();

	const source = $derived(sourceId ? explainer?.getSource(sourceId) : undefined);

	let wrapperEl = $state<HTMLDivElement | undefined>(undefined);
	let containerEl = $state<HTMLDivElement | undefined>(undefined);

	/**
	 * Raw measured container width. Used directly by the mobile layout
	 * (no large left margin to reserve, so the chart fits exactly).
	 */
	let measuredWidth = $state(560);

	/**
	 * Width used for the desktop layout's Plot SVG. Clamped to a minimum
	 * that exceeds the largest possible marginLeft (320) + marginRight
	 * (88) so Plot never emits negative bar widths. The wrapper has
	 * `[&_svg]:max-w-full!` so an SVG authored at 420px scales DOWN
	 * visually inside a narrower container via its viewBox.
	 */
	let chartWidth = $derived(Math.max(420, measuredWidth));

	/**
	 * Where to switch to the label-on-top mobile layout. 540px is roughly
	 * the breakpoint at which a label like "Production or marketing
	 * controls" still leaves enough room for a meaningful bar in the
	 * desktop layout.
	 */
	const MOBILE_BREAKPOINT = 540;
	let isNarrow = $derived(measuredWidth > 0 && measuredWidth < MOBILE_BREAKPOINT);

	/**
	 * Available height from the wrapping sticky column.
	 * 0 means "not yet measured" → fall back to default row heights.
	 */
	let availableHeight = $state(0);

	// Color-blind-safe brand palette (all WCAG AA on cream #fef9ef)
	const AFTER_COLOR = '#be185d'; // brand raspberry — deuteranopia-safe vs navy/amber
	const BEFORE_COLOR = '#0a0a0a18';
	const RULE_COLOR = '#0a0a0a28';

	const prefersReducedMotion =
		typeof window !== 'undefined' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/**
	 * Animate bars in the given container using IntersectionObserver.
	 * SVG size stays fixed from the start — zero CLS.
	 *
	 * Strategy:
	 *  1. Read final `width` from every <rect> and replace it with CSS width:0.
	 *  2. Hide <text> labels (they'd appear at wrong positions while bars grow).
	 *  3. On first intersection, stagger-transition widths to final values.
	 *  4. Fade text in after the last bar finishes.
	 */
	function setupBarAnimation(container: HTMLElement) {
		if (prefersReducedMotion) return;

		const rects = Array.from(container.querySelectorAll<SVGRectElement>('svg rect'));
		const texts = Array.from(container.querySelectorAll<SVGTextElement>('svg text'));
		if (!rects.length) return;

		const finalWidths = rects.map((r) => parseFloat(r.getAttribute('width') ?? '0'));
		rects.forEach((r) => (r.style.width = '0'));
		texts.forEach((t) => (t.style.opacity = '0'));

		const STAGGER = 60; // ms per bar
		const DURATION = 520; // ms bar growth

		const animate = () => {
			rects.forEach((rect, i) => {
				rect.style.transition = `width ${DURATION}ms cubic-bezier(0.25,0.46,0.45,0.94) ${i * STAGGER}ms`;
				rect.style.width = `${finalWidths[i]}px`;
			});
			const textDelay = rects.length * STAGGER + DURATION - 120;
			setTimeout(() => {
				texts.forEach((t) => {
					t.style.transition = 'opacity 200ms ease-out';
					t.style.opacity = '1';
				});
			}, textDelay);
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
	}

	/**
	 * Compute a responsive row height that fits `numBars` bars within the
	 * available height (minus fixed overhead for title / subtitle / source).
	 *
	 * Clamped: [MIN_ROW_H, MAX_ROW_H].
	 */
	function calcRowH(numBars: number, defaultH: number): number {
		const MIN_ROW_H = 28;
		const MAX_ROW_H = defaultH;
		if (!availableHeight || numBars === 0) return MAX_ROW_H;
		const overhead = (title ? 30 : 0) + (subtitle ? 22 : 0) + (sourceId ? 24 : 0) + 56;
		const freeH = availableHeight - overhead;
		const ideal = Math.floor(freeH / numBars);
		return Math.max(MIN_ROW_H, Math.min(MAX_ROW_H, ideal));
	}

	/**
	 * Estimate the pixel width needed to render a label string in Lato.
	 * 0.82× is intentionally generous — em-dashes, uppercase and wide glyphs
	 * make Lato significantly wider than a "typical" sans-serif average.
	 * +24px covers tickPadding (10px) plus a comfortable safety margin.
	 */
	function estimateLabelWidth(text: string, fontSize: number): number {
		return Math.ceil(text.length * fontSize * 0.82) + 24;
	}

	/** Standardised colour pick for a bar, with the before/after heuristic. */
	function colorFor(d: ObsBarDataPoint): string {
		return d.color ?? (d.group?.toLowerCase().includes('after') ? AFTER_COLOR : BEFORE_COLOR);
	}

	/**
	 * Adaptive per-row metrics for the mobile layout. Mobile bars do not
	 * scroll — the whole chart must fit inside the sticky `availableHeight`
	 * column, otherwise the bottom items get clipped (the parent has
	 * `overflow-hidden`). We compress row height + label spacing
	 * progressively as the item count grows, with a readable floor.
	 */
	interface MobileMetrics {
		rowH: number;
		labelFontSize: number;
		labelMarginTop: number;
		labelMarginBottom: number;
		valueFontSize: number;
		sectionFontSize: number;
		sectionMarginTop: number;
		sectionMarginBottom: number;
	}

	const MOBILE_METRIC_TIERS: MobileMetrics[] = [
		// Roomy — default desktop-equivalent feel
		{ rowH: 32, labelFontSize: 13, labelMarginTop: 10, labelMarginBottom: 4, valueFontSize: 14, sectionFontSize: 15, sectionMarginTop: 18, sectionMarginBottom: 6 },
		{ rowH: 28, labelFontSize: 13, labelMarginTop: 8, labelMarginBottom: 3, valueFontSize: 13, sectionFontSize: 14, sectionMarginTop: 14, sectionMarginBottom: 5 },
		{ rowH: 24, labelFontSize: 12, labelMarginTop: 6, labelMarginBottom: 2, valueFontSize: 12, sectionFontSize: 14, sectionMarginTop: 12, sectionMarginBottom: 4 },
		{ rowH: 22, labelFontSize: 12, labelMarginTop: 4, labelMarginBottom: 2, valueFontSize: 12, sectionFontSize: 13, sectionMarginTop: 10, sectionMarginBottom: 4 },
		{ rowH: 20, labelFontSize: 11, labelMarginTop: 3, labelMarginBottom: 1, valueFontSize: 11, sectionFontSize: 13, sectionMarginTop: 8, sectionMarginBottom: 3 },
		{ rowH: 18, labelFontSize: 11, labelMarginTop: 2, labelMarginBottom: 1, valueFontSize: 11, sectionFontSize: 12, sectionMarginTop: 6, sectionMarginBottom: 2 }
	];

	function calcMobileMetrics(numItems: number, numSections: number): MobileMetrics {
		if (!availableHeight || numItems === 0) return MOBILE_METRIC_TIERS[0];

		// Vertical overhead OUTSIDE the bars container that we cannot shrink:
		// title block, subtitle block, source button, plus a little wrapper padding.
		const overhead = (title ? 32 : 0) + (subtitle ? 26 : 0) + (sourceId ? 30 : 0) + 8;
		const target = Math.max(0, availableHeight - overhead);

		// Try each tier (roomiest → tightest) and pick the first that fits.
		for (const m of MOBILE_METRIC_TIERS) {
			const labelBlock = m.labelFontSize * 1.25 + m.labelMarginTop + m.labelMarginBottom;
			const sectionBlock = m.sectionFontSize * 1.2 + m.sectionMarginTop + m.sectionMarginBottom;
			const total = numItems * (labelBlock + m.rowH) + numSections * sectionBlock;
			if (total <= target) return m;
		}
		return MOBILE_METRIC_TIERS.at(-1)!;
	}

	/**
	 * Stacked layout: render ONE bar as its own tiny Plot, with no y-axis
	 * and no left margin. The label is added separately as a sibling
	 * HTML heading (see callers below) so the bar can use the full
	 * container width.
	 *
	 * When `containerW` is wider than a phone (≥ 400px) we scale the bar
	 * height up proportionally so it looks bold on larger screens.
	 */
	function buildMobileSingleBar(
		Plot: typeof import('@observablehq/plot'),
		item: ObsBarDataPoint,
		domainMax: number,
		metrics: MobileMetrics,
		containerW = measuredWidth
	): Element {
		// On wider containers scale bar height up to a comfortable maximum.
		const scaledRowH =
			containerW >= 400
				? Math.min(52, Math.round(metrics.rowH * (1 + (containerW - 400) / 800)))
				: metrics.rowH;
		// Only reserve right margin for bars that won't get an inside label.
		// Bars whose pixel width ≥ INSIDE_MIN_PX will carry their value label
		// inside (white text), so they don't need right-margin space.
		const MARGIN_RIGHT_OUTSIDE = Math.round(metrics.valueFontSize * 6);
		const barPxW = (item.value / domainMax) * containerW;
		const insideLabel = barPxW >= 52;
		const MARGIN_RIGHT = insideLabel ? 8 : MARGIN_RIGHT_OUTSIDE;
		return Plot.plot({
			width: containerW,
			height: scaledRowH,
			marginLeft: 0,
			marginRight: MARGIN_RIGHT,
			marginTop: 2,
			marginBottom: 2,
			style: {
				background: 'transparent',
				fontFamily: '"Lato", system-ui, sans-serif',
				color: '#0a0a0a',
				overflow: 'visible'
			},
			x: { label: null, axis: null, domain: [0, domainMax] },
			y: { label: null, axis: null },
			marks: [
				Plot.barX([item], {
					x: 'value',
					y: () => '',
					fill: colorFor(item),
					rx: Math.max(3, Math.round(metrics.rowH / 5))
				}),
				Plot.text([item], {
					x: 'value',
					y: () => '',
					text: (d: ObsBarDataPoint) => `${prefix}${d.value}${unit}`,
					dx: insideLabel ? -8 : 8,
					textAnchor: insideLabel ? 'end' : 'start',
					fill: insideLabel ? 'white' : '#0a0a0a',
					fontWeight: '700',
					fontSize: metrics.valueFontSize
				}),
				Plot.ruleX([0], { stroke: RULE_COLOR, strokeWidth: 1.5 })
			]
		});
	}

	/** Append an HTML caption above a single mobile bar. */
	function appendMobileLabel(
		parent: HTMLElement,
		text: string,
		metrics: MobileMetrics,
		opts: { strong?: boolean; firstItem?: boolean } = {}
	) {
		const p = document.createElement('p');
		const weight = opts.strong ? 'font-semibold' : '';
		p.className = `font-body text-ink leading-tight ${weight}`.trim();
		const top = opts.firstItem ? 0 : metrics.labelMarginTop;
		p.style.cssText = `font-size: ${metrics.labelFontSize}px; margin: ${top}px 0 ${metrics.labelMarginBottom}px 0; text-align: left;`;
		p.textContent = text;
		parent.appendChild(p);
	}

	/** Append a bold section heading on mobile (used in grouped mode). */
	function appendMobileSectionHeading(
		parent: HTMLElement,
		text: string,
		isFirst: boolean,
		metrics: MobileMetrics
	) {
		const p = document.createElement('p');
		p.className = 'font-display font-bold text-ink leading-tight';
		const top = isFirst ? 0 : metrics.sectionMarginTop;
		p.style.cssText = `font-size: ${metrics.sectionFontSize}px; margin: ${top}px 0 ${metrics.sectionMarginBottom}px 0; text-align: left;`;
		p.textContent = text;
		parent.appendChild(p);
	}

	/** Desktop layout: horizontal-bar chart for `rows` with y-axis labels. */
	function buildMiniChart(
		Plot: typeof import('@observablehq/plot'),
		rows: ObsBarDataPoint[],
		domainMax: number,
		rowH: number
	): Element {
		const compact = rowH < 42;
		const fs = compact ? '11px' : '13px';
		const fontPx = compact ? 11 : 13;
		const valueFontSize = compact ? 12 : 15;
		const longestGroupStr = rows.reduce(
			(max, d) => (d.group && d.group.length > max.length ? d.group : max),
			''
		);
		const marginLeft = Math.min(
			300,
			Math.max(compact ? 120 : 150, estimateLabelWidth(longestGroupStr, fontPx))
		);
		const marginRight = 56;
		const chartAreaW = chartWidth - marginLeft - marginRight;
		const h = rows.length * rowH + 20;
		return Plot.plot({
			width: chartWidth,
			height: h,
			marginLeft,
			marginRight,
			marginTop: 4,
			marginBottom: 4,
			style: {
				background: 'transparent',
				fontFamily: '"Lato", system-ui, sans-serif',
				color: '#0a0a0a',
				overflow: 'visible',
				fontSize: fs
			},
			x: { label: null, axis: null, domain: [0, domainMax] },
			y: { label: null, tickSize: 0, tickPadding: compact ? 6 : 10 },
			marks: [
				Plot.barX(rows, {
					x: 'value',
					y: 'group',
					fill: colorFor,
					rx: compact ? 4 : 7
				}),
				// Inside labels (wide bars — white text)
				Plot.text(rows.filter((d) => (d.value / domainMax) * chartAreaW >= 52), {
					x: 'value',
					y: 'group',
					text: (d: ObsBarDataPoint) => `${prefix}${d.value}${unit}`,
					dx: -8,
					textAnchor: 'end',
					fill: 'white',
					fontWeight: '700',
					fontSize: valueFontSize
				}),
				// Outside labels (narrow bars — dark text)
				Plot.text(rows.filter((d) => (d.value / domainMax) * chartAreaW < 52), {
					x: 'value',
					y: 'group',
					text: (d: ObsBarDataPoint) => `${prefix}${d.value}${unit}`,
					dx: 8,
					textAnchor: 'start',
					fill: '#0a0a0a',
					fontWeight: '700',
					fontSize: valueFontSize
				}),
				Plot.ruleX([0], { stroke: RULE_COLOR, strokeWidth: 1.5 })
			]
		});
	}

	$effect(() => {
		if (!browser || !containerEl || data.length === 0) return;

		// CRITICAL: read reactive values SYNCHRONOUSLY here so Svelte
		// tracks them as dependencies of this effect. Reads inside the
		// async `.then()` callback below DON'T register as dependencies,
		// so without these touches the effect would only run once on
		// mount and never re-render when `measuredWidth` (and therefore
		// `isNarrow` / `chartWidth`) updates on resize.
		const narrow = isNarrow;
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		measuredWidth;
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		chartWidth;
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		availableHeight;

		let destroyed = false;

		import('@observablehq/plot').then((Plot) => {
			if (destroyed || !containerEl) return;

			const hasGroups = data.some((d) => d.group);
			const actualMax = Math.max(...data.map((d) => d.value));
			// Tight domain — just 8% beyond actual max. Value labels go INSIDE wide
			// bars (white text) and outside narrow bars, so we no longer need the
			// 30% "reserved for label" headroom.
			const domainMax = maxValue ?? actualMax * 1.08;
			// Bar pixel width helper used to decide inside vs outside label placement.
			const INSIDE_MIN_PX = 52;

			containerEl.innerHTML = '';

			// ── Decide layout: label-left (desktop) vs label-above (stacked) ──
			//
			// We use label-above whenever the container is narrow OR whenever
			// the estimated left-label margin would leave fewer than 200px for
			// the actual bars. This makes the decision data-driven (long labels
			// in a medium-width container trigger stacked layout automatically)
			// rather than purely width-based.
			const longestForLayout = hasGroups
				? data.reduce((m, d) => (d.group && d.group.length > m.length ? d.group : m), '')
				: data.reduce((m, d) => (d.label.length > m.length ? d.label : m), '');
			const estimatedLeftMargin = Math.min(320, Math.max(140, estimateLabelWidth(longestForLayout, 13)));
			const projectedBarArea = chartWidth - estimatedLeftMargin - 88;
			const useStackedLayout = narrow || projectedBarArea < 200;

			// ── Stacked path ────────────────────────────────────────────
			// Label rendered as HTML ABOVE each bar. Zero left margin means
			// the bar uses the full container width. Adapts row height and
			// font size to the available column height via calcMobileMetrics.
			if (useStackedLayout) {
				const numSections = hasGroups ? new Set(data.map((d) => d.label)).size : 0;
				const metrics = calcMobileMetrics(data.length, numSections);

				if (hasGroups) {
					const uniqueLabels = [...new Set(data.map((d) => d.label))];
					let firstItem = true;
					for (const [i, label] of uniqueLabels.entries()) {
						appendMobileSectionHeading(containerEl, label, i === 0, metrics);
						const rows = data.filter((d) => d.label === label);
						for (const item of rows) {
							if (item.group) {
								appendMobileLabel(containerEl, item.group, metrics, { firstItem });
							}
						containerEl.appendChild(buildMobileSingleBar(Plot, item, domainMax, metrics, measuredWidth));
						firstItem = false;
					}
				}
			} else {
				// Sort by value descending so the biggest bar reads first
				const sorted = [...data].sort((a, b) => b.value - a.value);
				for (const [i, item] of sorted.entries()) {
					appendMobileLabel(containerEl, item.label, metrics, {
						strong: true,
						firstItem: i === 0
					});
					containerEl.appendChild(buildMobileSingleBar(Plot, item, domainMax, metrics, measuredWidth));
				}
			}

				setupBarAnimation(containerEl);
				return;
			}

			// ── Label-left grouped mode ────────────────────────────────
			if (hasGroups) {
				const uniqueLabels = [...new Set(data.map((d) => d.label))];
				const maxRowsPerGroup = Math.max(
					...uniqueLabels.map((l) => data.filter((d) => d.label === l).length)
				);
				const totalBars = uniqueLabels.length * maxRowsPerGroup;
				const rowH = calcRowH(totalBars + uniqueLabels.length, 56);
				const compact = rowH < 42;

				for (const [i, label] of uniqueLabels.entries()) {
					const rows = data.filter((d) => d.label === label);

					const heading = document.createElement('p');
					heading.className = [
						'font-display font-bold text-ink leading-snug',
						i > 0 ? (compact ? 'mt-4' : 'mt-7') : 'mt-0'
					].join(' ');
					heading.style.cssText = `font-size: ${compact ? '0.85rem' : '1rem'}; margin-bottom: 4px;`;
					heading.textContent = label;
					containerEl.appendChild(heading);

					const chart = buildMiniChart(Plot, rows, domainMax, rowH);
					containerEl.appendChild(chart);
				}

				setupBarAnimation(containerEl);
				return;
			}

			// ── Label-left simple mode ─────────────────────────────────
			// Slightly taller default rows for bolder visual presence.
			const rowH = calcRowH(data.length, 72);
			const compact = rowH < 42;
			const fontPxSimple = compact ? 11 : 13;
			const h = data.length * rowH + 32;
			const longestLabelStr = data.reduce(
				(max, d) => (d.label.length > max.length ? d.label : max),
				''
			);
			const simpleMarginLeft = Math.min(
				320,
				Math.max(compact ? 140 : 170, estimateLabelWidth(longestLabelStr, fontPxSimple))
			);
			// Right margin only needs to fit outside-label values on narrow bars.
			// Wide bars carry the label inside (white text), so no extra space needed.
			const simpleMarginRight = 56;
			const simpleChartAreaW = chartWidth - simpleMarginLeft - simpleMarginRight;

			const chart = Plot.plot({
				width: chartWidth,
				height: h,
				marginLeft: simpleMarginLeft,
				marginRight: simpleMarginRight,
				marginTop: 8,
				marginBottom: 8,
				style: {
					background: 'transparent',
					fontFamily: '"Lato", system-ui, sans-serif',
					color: '#0a0a0a',
					overflow: 'visible',
					fontSize: compact ? '11px' : '13px'
				},
				x: { label: null, axis: null, domain: [0, domainMax] },
				y: { label: null, tickSize: 0, tickPadding: compact ? 6 : 10 },
				marks: [
					Plot.barX(data, {
						x: 'value',
						y: 'label',
						fill: (d: ObsBarDataPoint) => d.color ?? AFTER_COLOR,
						rx: compact ? 4 : 7,
						sort: { y: '-x' }
					}),
					// Inside labels for wide bars (white text sits within the bar)
				Plot.text(data.filter((d) => (d.value / domainMax) * simpleChartAreaW >= INSIDE_MIN_PX), {
						x: 'value',
						y: 'label',
						text: (d: ObsBarDataPoint) => `${prefix}${d.value}${unit}`,
						dx: -9,
						textAnchor: 'end',
						fill: 'white',
						fontWeight: '700',
						fontSize: compact ? 12 : 15
					}),
					// Outside labels for narrow bars (dark text after the bar)
					Plot.text(data.filter((d) => (d.value / domainMax) * simpleChartAreaW < INSIDE_MIN_PX), {
						x: 'value',
						y: 'label',
						text: (d: ObsBarDataPoint) => `${prefix}${d.value}${unit}`,
						dx: 8,
						textAnchor: 'start',
						fill: '#0a0a0a',
						fontWeight: '700',
						fontSize: compact ? 12 : 15
					}),
					Plot.ruleX([0], { stroke: RULE_COLOR, strokeWidth: 1.5 })
				]
			});

			containerEl.appendChild(chart);
			setupBarAnimation(containerEl);
		});

		return () => {
			destroyed = true;
		};
	});

	$effect(() => {
		if (!browser || !containerEl) return;
		const ro = new ResizeObserver(([e]) => {
			measuredWidth = e.contentRect.width || 560;
		});
		ro.observe(containerEl);
		return () => ro.disconnect();
	});

	// Observe the nearest sticky-viz column to scale row heights against
	// the fixed-height viewport slot. When this chart is rendered inline
	// (no `[data-viz-sticky]` ancestor — e.g. the mobile path below the
	// text card), there is no height ceiling, so we leave `availableHeight`
	// at 0 and `calcMobileMetrics` falls through to the roomiest tier.
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

<div bind:this={wrapperEl} class="flex w-full min-w-0 max-w-full flex-col items-start gap-3">
	{#if title}
		<p class="font-display text-lg font-bold leading-tight text-ink md:text-xl">{title}</p>
	{/if}
	<!--
		The Plot-generated SVG has an explicit `width` attribute. During the
		brief window before our ResizeObserver fires (or if it never fires for
		a hidden ancestor), the `[&_svg]:max-w-full` rule forces the SVG to
		respect its parent's width and prevents it from ever pushing the grid
		track wider than the viewport.
	-->
	<div bind:this={containerEl} class="w-full min-w-0 max-w-full [&_svg]:max-w-full! [&_svg]:h-auto"></div>
	{#if subtitle}
		<p class="font-body text-xs text-ink/50">{subtitle}</p>
	{/if}
	{#if source}
		<button
			type="button"
			onclick={() => openSourceSheet(source!.id)}
			class="group flex w-fit cursor-pointer items-center gap-1 text-sm font-semibold text-ink/40 transition-colors hover:text-brand-red"
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
</div>
