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
	import { getExplainerHolder } from '$lib/context/explainer.svelte';
	import { openSourceSheet } from '$lib/context/sheet';

	const explainerHolder = getExplainerHolder();
	const explainer = $derived(explainerHolder?.current ?? null);

	import type { ObsBarDataPoint } from '$lib/types/explainer';

	interface Props {
		data?: ObsBarDataPoint[];
		title?: string;
		subtitle?: string;
		unit?: string;
		prefix?: string;
		maxValue?: number;
		layout?: 'bar' | 'column';
		animate?: boolean;
		sourceId?: string;
	}

	let {
		data = [],
		title,
		subtitle,
		unit = '%',
		prefix = '',
		maxValue,
		layout = 'bar',
		animate = true,
		sourceId
	}: Props = $props();

	const source = $derived(sourceId ? explainer?.getSource(sourceId) : undefined);

	let wrapperEl = $state<HTMLDivElement | undefined>(undefined);
	let containerEl = $state<HTMLDivElement | undefined>(undefined);
	let inStickySlot = $state(false);

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
	let animatedChartSignature = $state('');

	// Color-blind-safe brand palette (all WCAG AA on cream #fef9ef)
	const AFTER_COLOR = '#be185d'; // brand raspberry — deuteranopia-safe vs navy/amber
	const BEFORE_COLOR = '#0a0a0a18';
	const RULE_COLOR = '#0a0a0a28';

	const prefersReducedMotion =
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
		if (prefersReducedMotion || !animate) return;

		const rects = Array.from(container.querySelectorAll<SVGRectElement>('svg rect'));
		const texts = Array.from(container.querySelectorAll<SVGTextElement>('svg text'));
		if (!rects.length) return;

		const finalWidths = rects.map((r) => parseFloat(r.getAttribute('width') ?? '0'));
		rects.forEach((r) => (r.style.width = '0'));
		texts.forEach((t) => (t.style.opacity = '0'));

		const STAGGER = 60; // ms per bar
		const DURATION = 520; // ms bar growth

		const runAnimation = () => {
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
					requestAnimationFrame(() => requestAnimationFrame(runAnimation));
					io.disconnect();
				}
			},
			{ threshold: 0.15 }
		);
		io.observe(container);
	}

	/**
	 * Compute a responsive row height that fits `numBars` bars within the
	 * available height (minus realistic overhead for every non-SVG element).
	 *
	 * Key corrections vs the naive version:
	 *  - Title can wrap to 2 lines (long titles at ~20px/line → 56 px).
	 *  - Subtitle can wrap to 2–3 lines (12px text → 44 px).
	 *  - flex gap-3 (12 px) × up to 3 gaps between elements.
	 *  - Plot's own marginTop + marginBottom (16 px total) live INSIDE the
	 *    SVG budget, so they must be subtracted before dividing by numBars.
	 *    Without this the SVG always overflows the budget by 16 px.
	 *  - A 16 px comfort cushion so the source button never sits flush
	 *    against the bottom of the sticky column.
	 *
	 * Clamped: [MIN_ROW_H, MAX_ROW_H].
	 */
	function calcRowH(numBars: number, defaultH: number): number {
		const MIN_ROW_H = 26;
		const MAX_ROW_H = defaultH;
		if (!availableHeight || numBars === 0) return MAX_ROW_H;

		const titleH = title ? 56 : 0; // up to 2 wrapped lines at text-xl
		const subtitleH = subtitle ? 44 : 0; // up to 3 wrapped lines at text-xs
		const sourceH = sourceId ? 32 : 0;
		const gaps = 12 * 3; // gap-3 × 3 inter-element gaps
		const svgMargins = 16; // Plot marginTop:8 + marginBottom:8
		const cushion = 16;
		const overhead = titleH + subtitleH + sourceH + gaps + svgMargins + cushion;

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

	function valueLabel(d: ObsBarDataPoint): string {
		return `${prefix}${d.value}${unit}`;
	}

	function columnValueLabel(d: ObsBarDataPoint): string {
		return `${prefix}${d.value}`;
	}

	function estimateValueLabelWidth(text: string, fontSize: number): number {
		return Math.ceil(text.length * fontSize * 0.62) + 18;
	}

	function shortLabel(label: string): string {
		return label.match(/D\d+/)?.[0] ?? label;
	}

	function chartSignature(): string {
		return JSON.stringify({
			data,
			layout,
			maxValue,
			prefix,
			unit
		});
	}

	function setupBarAnimationOnce(container: HTMLElement, signature: string) {
		if (animatedChartSignature === signature) return;
		animatedChartSignature = signature;
		setupBarAnimation(container);
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
		{
			rowH: 32,
			labelFontSize: 13,
			labelMarginTop: 10,
			labelMarginBottom: 4,
			valueFontSize: 14,
			sectionFontSize: 15,
			sectionMarginTop: 18,
			sectionMarginBottom: 6
		},
		{
			rowH: 28,
			labelFontSize: 13,
			labelMarginTop: 8,
			labelMarginBottom: 3,
			valueFontSize: 13,
			sectionFontSize: 14,
			sectionMarginTop: 14,
			sectionMarginBottom: 5
		},
		{
			rowH: 24,
			labelFontSize: 12,
			labelMarginTop: 6,
			labelMarginBottom: 2,
			valueFontSize: 12,
			sectionFontSize: 14,
			sectionMarginTop: 12,
			sectionMarginBottom: 4
		},
		{
			rowH: 22,
			labelFontSize: 12,
			labelMarginTop: 4,
			labelMarginBottom: 2,
			valueFontSize: 12,
			sectionFontSize: 13,
			sectionMarginTop: 10,
			sectionMarginBottom: 4
		},
		{
			rowH: 20,
			labelFontSize: 11,
			labelMarginTop: 3,
			labelMarginBottom: 1,
			valueFontSize: 11,
			sectionFontSize: 13,
			sectionMarginTop: 8,
			sectionMarginBottom: 3
		},
		{
			rowH: 18,
			labelFontSize: 11,
			labelMarginTop: 2,
			labelMarginBottom: 1,
			valueFontSize: 11,
			sectionFontSize: 12,
			sectionMarginTop: 6,
			sectionMarginBottom: 2
		}
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
		const label = valueLabel(item);
		const labelW = estimateValueLabelWidth(label, metrics.valueFontSize);
		const MARGIN_RIGHT_OUTSIDE = Math.min(Math.round(containerW * 0.44), labelW + 10);
		const plotW = containerW - MARGIN_RIGHT_OUTSIDE;
		const barPxW = (item.value / domainMax) * plotW;
		const insideLabel = barPxW >= labelW;
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
					text: valueLabel,
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

	function buildColumnChart(
		Plot: typeof import('@observablehq/plot'),
		rows: ObsBarDataPoint[],
		domainMax: number
	): Element {
		const sorted = [...rows].sort((a, b) => {
			const ai = Number(shortLabel(a.label).replace('D', ''));
			const bi = Number(shortLabel(b.label).replace('D', ''));
			return (Number.isFinite(ai) ? ai : 0) - (Number.isFinite(bi) ? bi : 0);
		});
		const yMin = 0;
		const yMax = Math.ceil(domainMax / 5) * 5;
		const chartH =
			availableHeight > 0
				? Math.min(Math.max(isNarrow ? 220 : 260, Math.round(availableHeight * 0.54)), 340)
				: isNarrow
					? 240
					: 300;
		const valueFontSize = isNarrow ? 12 : 13;

		return Plot.plot({
			width: chartWidth,
			height: chartH,
			marginTop: 22,
			marginRight: 8,
			marginBottom: 34,
			marginLeft: isNarrow ? 28 : 36,
			style: {
				background: 'transparent',
				fontFamily: '"Lato", system-ui, sans-serif',
				color: '#0a0a0a',
				overflow: 'visible',
				fontSize: isNarrow ? '10px' : '11px'
			},
			x: {
				label: null,
				tickSize: 0,
				tickPadding: 7,
				domain: sorted.map((d) => shortLabel(d.label))
			},
			y: {
				label: null,
				domain: [yMin, yMax],
				ticks: 4,
				grid: true,
				tickFormat: (d: number) => `${d}`
			},
			marks: [
				Plot.barY(sorted, {
					x: (d: ObsBarDataPoint) => shortLabel(d.label),
					y: 'value',
					y1: yMin,
					fill: colorFor,
					rx: 4
				}),
				Plot.text(sorted, {
					x: (d: ObsBarDataPoint) => shortLabel(d.label),
					y: 'value',
					text: columnValueLabel,
					dy: -8,
					fill: '#0a0a0a',
					fontWeight: '800',
					fontSize: valueFontSize
				}),
				Plot.ruleY([yMin], { stroke: RULE_COLOR, strokeWidth: 1.5 })
			]
		});
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
		const fitsInside = (d: ObsBarDataPoint) =>
			(d.value / domainMax) * chartAreaW >= estimateValueLabelWidth(valueLabel(d), valueFontSize);
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
				Plot.text(rows.filter(fitsInside), {
					x: 'value',
					y: 'group',
					text: valueLabel,
					dx: -8,
					textAnchor: 'end',
					fill: 'white',
					fontWeight: '700',
					fontSize: valueFontSize
				}),
				// Outside labels (narrow bars — dark text)
				Plot.text(
					rows.filter((d) => !fitsInside(d)),
					{
						x: 'value',
						y: 'group',
						text: valueLabel,
						dx: 8,
						textAnchor: 'start',
						fill: '#0a0a0a',
						fontWeight: '700',
						fontSize: valueFontSize
					}
				),
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
		const chartLayout = layout;
		const animationKey = chartSignature();
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
			containerEl.innerHTML = '';

			if (chartLayout === 'column' && !hasGroups) {
				containerEl.appendChild(buildColumnChart(Plot, data, domainMax));
				return;
			}

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
			const estimatedLeftMargin = Math.min(
				320,
				Math.max(140, estimateLabelWidth(longestForLayout, 13))
			);
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
							containerEl.appendChild(
								buildMobileSingleBar(Plot, item, domainMax, metrics, measuredWidth)
							);
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
						containerEl.appendChild(
							buildMobileSingleBar(Plot, item, domainMax, metrics, measuredWidth)
						);
					}
				}

				setupBarAnimationOnce(containerEl, animationKey);
				return;
			}

			// ── Label-left grouped mode ────────────────────────────────
			if (hasGroups) {
				const uniqueLabels = [...new Set(data.map((d) => d.label))];
				const maxRowsPerGroup = Math.max(
					...uniqueLabels.map((l) => data.filter((d) => d.label === l).length)
				);
				const totalBars = uniqueLabels.length * maxRowsPerGroup;
				const defaultGroupRowH = Math.max(32, Math.round(320 / Math.max(1, totalBars)));
				const rowH = calcRowH(totalBars + uniqueLabels.length, defaultGroupRowH);
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

				setupBarAnimationOnce(containerEl, animationKey);
				return;
			}

			// ── Label-left simple mode ─────────────────────────────────
			// Cap the default max row height: tall defaults look fine for 2–4
			// bars but produce an over-sized chart for 7–10 bars. Scale it down
			// so a 10-bar chart starts at ~44 px per row rather than 72.
			const defaultRowH = Math.max(38, Math.round(380 / Math.max(1, data.length)));
			const rowH = calcRowH(data.length, defaultRowH);
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
			const simpleValueFontSize = compact ? 12 : 15;
			const simpleFitsInside = (d: ObsBarDataPoint) =>
				(d.value / domainMax) * simpleChartAreaW >=
				estimateValueLabelWidth(valueLabel(d), simpleValueFontSize);

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
					Plot.text(data.filter(simpleFitsInside), {
						x: 'value',
						y: 'label',
						text: valueLabel,
						dx: -9,
						textAnchor: 'end',
						fill: 'white',
						fontWeight: '700',
						fontSize: simpleValueFontSize
					}),
					// Outside labels for narrow bars (dark text after the bar)
					Plot.text(
						data.filter((d) => !simpleFitsInside(d)),
						{
							x: 'value',
							y: 'label',
							text: valueLabel,
							dx: 8,
							textAnchor: 'start',
							fill: '#0a0a0a',
							fontWeight: '700',
							fontSize: simpleValueFontSize
						}
					),
					Plot.ruleX([0], { stroke: RULE_COLOR, strokeWidth: 1.5 })
				]
			});

			containerEl.appendChild(chart);
			setupBarAnimationOnce(containerEl, animationKey);
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
			inStickySlot = false;
			return;
		}
		inStickySlot = true;
		const ro = new ResizeObserver(([e]) => {
			availableHeight = e.contentRect.height || 0;
		});
		ro.observe(stickyAncestor);
		return () => ro.disconnect();
	});
</script>

<div
	bind:this={wrapperEl}
	class="flex w-full max-w-full min-w-0 flex-col items-start gap-3"
	class:translate-y-4={inStickySlot}
>
	{#if title}
		<p class="font-display text-lg leading-tight font-bold text-ink md:text-xl">{title}</p>
	{/if}
	<!--
		The Plot-generated SVG has an explicit `width` attribute. During the
		brief window before our ResizeObserver fires (or if it never fires for
		a hidden ancestor), the `[&_svg]:max-w-full` rule forces the SVG to
		respect its parent's width and prevents it from ever pushing the grid
		track wider than the viewport.
	-->
	<div
		bind:this={containerEl}
		class="w-full max-w-full min-w-0 [&_svg]:h-auto [&_svg]:max-w-full!"
	></div>
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
