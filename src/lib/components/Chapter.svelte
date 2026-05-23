<script lang="ts">
	/**
	 * <Chapter> — renders a single Chapter object as a full scrollytelling
	 * section.
	 *
	 * Layout intent
	 * -------------
	 * The chapter is a FIXED 50/50 grid that never reshapes between
	 * beats. The viz column shows whichever visual the step provides:
	 *   - `chart` / `image`  → the corresponding viz component
	 *   - `stat`             → the big stat number (`StatCard`)
	 *   - `quote`            → the editorial pull-quote (`QuoteBlock`)
	 *   - nothing of the above → empty viz column (whitespace)
	 *
	 * Every beat gets the same side-by-side rhythm: a clear "visual"
	 * (or whitespace where there's intentionally no visual) on one
	 * side, the supporting prose on the other.
	 *
	 * The story column is just the step's text (plain or `richText`).
	 * No inline stats/quotes — they've been hoisted into the viz column
	 * so the prose stays a clean, scannable column of reading text.
	 */
	import type { Chapter as ChapterData, VizConfig } from '$lib/types/explainer';
	import Scrolly from '$lib/components/scrolly/Scrolly.svelte';
	import Step from '$lib/components/scrolly/Step.svelte';
	import StatCard from '$lib/components/ui/StatCard.svelte';
	import QuoteBlock from '$lib/components/ui/QuoteBlock.svelte';
	import Eyebrow from '$lib/components/ui/Eyebrow.svelte';
	import KeyTakeaways from '$lib/components/ui/KeyTakeaways.svelte';
	import DonutChart from '$lib/components/viz/DonutChart.svelte';
	import ObsBarChart from '$lib/components/viz/ObsBarChart.svelte';
	import ObsTimelineChart from '$lib/components/viz/ObsTimelineChart.svelte';
	import ImageChart from '$lib/components/viz/ImageChart.svelte';
	import EraTimeline from '$lib/components/viz/EraTimeline.svelte';
	import BlueZonesMap from '$lib/components/viz/longevity/BlueZonesMap.svelte';
	import BillionDollarTimeline from '$lib/components/viz/longevity/BillionDollarTimeline.svelte';
	import { cn } from '$lib/utils/cn';
	import { posthog } from '$lib/analytics/posthog';
	import { getExplainerHolder } from '$lib/context/explainer.svelte';
	import { readerPositionElementId, trackReaderPosition } from '$lib/reader-position.svelte';

	interface Props {
		chapter: ChapterData;
		index: number;
	}

	let { chapter, index }: Props = $props();

	const closingSteps = $derived(chapter.steps.filter((s) => s.closingOnly));
	const visibleSteps = $derived(chapter.steps.filter((s) => !s.closingOnly));

	const accentBg = $derived(
		{
			red: 'from-cream via-cream to-brand-red/10',
			amber: 'from-cream via-cream to-brand-amber/10',
			pink: 'from-cream via-cream to-brand-pink/10',
			ink: 'from-cream to-cream',
			forest: 'from-cream via-cream to-brand-forest/10',
			blue: 'from-cream via-cream to-brand-ocean/10'
		}[chapter.accent]
	);

	const accentText = $derived(
		{
			red: 'gradient-warning',
			amber: 'gradient-amber',
			pink: 'gradient-shock',
			ink: 'text-ink',
			forest: 'gradient-forest',
			blue: 'gradient-ocean'
		}[chapter.accent]
	);

	const explainerHolder = getExplainerHolder();
	const explainer = $derived(explainerHolder?.current ?? null);
	const takeawaysAccent = $derived(explainer?.meta.accent === 'forest' ? 'forest' : 'warning');

	let sectionEl = $state<HTMLElement | undefined>(undefined);
	let activeStepIndex = $state(0);
	let lastPositionSave = { key: '', at: 0 };
	const isBlackout = $derived(visibleSteps[activeStepIndex]?.blackout === true);

	function chapterProgress(): number {
		const chapterCount = explainer?.chapters.length ?? 0;
		if (chapterCount <= 0) return 0;
		return chapter.number / chapterCount;
	}

	function stepVizKey(step: ChapterData['steps'][number] | undefined): string {
		if (!step) return 'empty';
		if (step.viz) return JSON.stringify(step.viz);
		if (step.stat) return `stat:${step.stat.value}:${step.stat.unit ?? ''}:${step.stat.label}`;
		return 'empty';
	}

	function hasStepViz(step: ChapterData['steps'][number] | undefined): boolean {
		return !!step?.viz || !!step?.stat;
	}

	function sourceIdsForStep(step: ChapterData['steps'][number] | undefined): string[] {
		const ids = new Set<string>();
		if (step?.stat?.sourceId) ids.add(step.stat.sourceId);
		if (step?.quote?.sourceId) ids.add(step.quote.sourceId);
		if (step?.viz && 'sourceId' in step.viz && typeof step.viz.sourceId === 'string') {
			ids.add(step.viz.sourceId);
		}
		return Array.from(ids);
	}

	function escapeCsvCell(value: unknown): string {
		if (value == null) return '';
		const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
		return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
	}

	function csvFromRows(rows: Array<Record<string, unknown>>): string | undefined {
		if (rows.length === 0) return undefined;
		const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
		return [
			headers.map(escapeCsvCell).join(','),
			...rows.map((row) => headers.map((header) => escapeCsvCell(row[header])).join(','))
		].join('\n');
	}

	function recordFromObject(value: object): Record<string, unknown> {
		return Object.fromEntries(Object.entries(value));
	}

	function rowsFromViz(viz: VizConfig | undefined): Array<Record<string, unknown>> {
		if (!viz) return [];
		switch (viz.type) {
			case 'bar':
			case 'bubble':
			case 'donut':
			case 'obs-bar':
				return viz.data.map(recordFromObject);
			case 'line':
				return viz.data.flatMap((series) =>
					series.data.map((point) => ({ series: series.name, ...recordFromObject(point) }))
				);
			case 'obs-timeline':
				return viz.series.flatMap((series) =>
					series.points.map((point) => ({ series: series.label, ...recordFromObject(point) }))
				);
			case 'era-timeline':
				return viz.eras.map(recordFromObject);
			default:
				return [];
		}
	}

	function visualTakeawayKind(
		step: ChapterData['steps'][number] | undefined
	): 'text' | 'image' | 'chart' | 'stat' | 'quote' | 'source' | 'dataset' {
		if (step?.stat) return 'stat';
		if (step?.quote) return 'quote';
		if (step?.viz?.type === 'image') return 'image';
		if (step?.viz) return rowsFromViz(step.viz).length ? 'dataset' : 'chart';
		return 'text';
	}

	function visualTakeawayText(step: ChapterData['steps'][number] | undefined): string {
		if (!step) return '';
		if (step.stat) {
			return [step.stat.value + (step.stat.unit ?? ''), step.stat.label, step.stat.context]
				.filter(Boolean)
				.join(' — ');
		}
		if (step.quote) {
			return [`"${step.quote.text}"`, step.quote.attribution].filter(Boolean).join(' — ');
		}
		const viz = step.viz;
		if (!viz) return '';
		if (viz.type === 'image') {
			return [viz.caption, viz.alt, viz.credit].filter(Boolean).join(' — ');
		}
		if ('title' in viz || 'subtitle' in viz) {
			const titledViz = viz as { title?: string; subtitle?: string; unit?: string };
			return [titledViz.title, titledViz.subtitle, titledViz.unit].filter(Boolean).join(' — ');
		}
		return step.text;
	}

	function visualTakeawayContentJson(step: ChapterData['steps'][number] | undefined): string {
		if (!step) return '{}';
		const sourceIds = sourceIdsForStep(step);
		const kind = visualTakeawayKind(step);
		const viz = step.viz;
		const rows = rowsFromViz(viz);
		const csv = csvFromRows(rows);
		const json = {
			label:
				step.stat?.label ||
				step.quote?.attribution ||
				(viz && 'title' in viz ? viz.title : undefined) ||
				(viz?.type === 'image' ? viz.caption || viz.alt : undefined),
			description: visualTakeawayText(step),
			sourceIds,
			sourceId: sourceIds[0],
			imageName: viz?.type === 'image' ? viz.name : undefined,
			alt: viz?.type === 'image' ? viz.alt : undefined,
			caption: viz?.type === 'image' ? viz.caption : undefined,
			credit: viz?.type === 'image' ? viz.credit : undefined,
			chartType: viz?.type,
			unit: viz && 'unit' in viz ? viz.unit : step.stat?.unit,
			csv,
			data: rows.length ? rows : undefined,
			kind
		};
		return JSON.stringify(json);
	}

	function repeatsPreviousViz(stepIndex: number): boolean {
		const step = visibleSteps[stepIndex];
		const previousStep = visibleSteps[stepIndex - 1];
		if (!hasStepViz(step) || !hasStepViz(previousStep)) return false;
		return stepVizKey(step) === stepVizKey(previousStep);
	}

	function sharesAdjacentViz(stepIndex: number): boolean {
		const step = visibleSteps[stepIndex];
		if (!hasStepViz(step)) return false;
		const key = stepVizKey(step);
		return (
			(hasStepViz(visibleSteps[stepIndex - 1]) &&
				stepVizKey(visibleSteps[stepIndex - 1]) === key) ||
			(hasStepViz(visibleSteps[stepIndex + 1]) && stepVizKey(visibleSteps[stepIndex + 1]) === key)
		);
	}

	function saveChapterPosition() {
		if (!explainer) return;
		trackReaderPosition({
			explainerSlug: explainer.meta.slug,
			chapterId: chapter.id,
			chapterNumber: chapter.number,
			chapterTitle: chapter.title,
			elementId: chapter.id,
			href: explainer.meta.href,
			progress: chapterProgress()
		});
	}

	function saveStepPosition(stepIndex: number) {
		if (!explainer) return;
		const step = visibleSteps[stepIndex];
		if (!step) return;

		const elementId = readerPositionElementId(chapter.id, step.id);
		const key = `${explainer.meta.slug}:${elementId}`;
		const now = Date.now();
		if (lastPositionSave.key === key && now - lastPositionSave.at < 750) return;
		lastPositionSave = { key, at: now };

		trackReaderPosition({
			explainerSlug: explainer.meta.slug,
			chapterId: chapter.id,
			chapterNumber: chapter.number,
			chapterTitle: chapter.title,
			stepId: step.id,
			stepIndex,
			elementId,
			href: explainer.meta.href,
			progress: chapterProgress()
		});
	}

	$effect(() => {
		if (!sectionEl) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					posthog.capture('chapter_viewed', {
						explainer_slug: explainer?.meta.slug,
						chapter_id: chapter.id,
						chapter_number: chapter.number,
						chapter_title: chapter.title
					});
					saveChapterPosition();
					observer.disconnect();
				}
			},
			{ threshold: 0.1 }
		);
		observer.observe(sectionEl);
		return () => observer.disconnect();
	});

	/**
	 * Fire `step_viewed` whenever the active step changes.
	 * Fires for every step transition, including the first (step 0).
	 * The step index is relative to `visibleSteps` (closingOnly steps excluded).
	 */
	function handleActiveStep(stepIndex: number) {
		activeStepIndex = stepIndex;
		const step = visibleSteps[stepIndex];
		if (!step) return;
		saveStepPosition(stepIndex);
		posthog.capture('step_viewed', {
			explainer_slug: explainer?.meta.slug,
			chapter_id: chapter.id,
			chapter_number: chapter.number,
			step_id: step.id,
			step_index: stepIndex,
			step_count: visibleSteps.length
		});
	}

	function handleChapterTldrOpen() {
		posthog.capture('chapter_tldr_opened', {
			explainer_slug: explainer?.meta.slug,
			chapter_id: chapter.id,
			chapter_number: chapter.number,
			chapter_title: chapter.title
		});
	}
</script>

<section
	bind:this={sectionEl}
	id={chapter.id}
	class={cn(
		'chapter-section relative overflow-clip bg-linear-to-b',
		accentBg,
		index % 2 === 1 && 'bg-cream-soft',
		isBlackout && 'is-blackout'
	)}
	aria-labelledby={`${chapter.id}-title`}
>
	<!-- Chapter opener: full-bleed intro before the scrolly kicks in. -->
	<div
		class="mx-auto w-full max-w-(--container-wide) min-w-0 px-6 pt-14 pb-8 lg:px-8 lg:pt-32 lg:pb-20"
	>
		<div class="flex flex-wrap items-center gap-x-4 gap-y-3">
			<Eyebrow emoji={chapter.emoji}>{chapter.eyebrow}</Eyebrow>
			{#if chapter.summary || chapter.keyTakeaways?.length}
				<KeyTakeaways
					items={chapter.keyTakeaways ?? []}
					variant="chapter"
					accent={takeawaysAccent}
					slug={`${explainer?.meta.slug ?? 'explainer'}-${chapter.id}`}
					summary={chapter.summary}
					eyebrow={`Chapter ${chapter.number} takeaways`}
					title={chapter.title}
					buttonAriaLabel={`Open TL;DR for Chapter ${chapter.number}: ${chapter.title}`}
					onOpen={handleChapterTldrOpen}
				/>
			{/if}
		</div>
		<h2
			id={`${chapter.id}-title`}
			class={cn(
				'mt-4 max-w-5xl font-display leading-[1.05] font-bold text-balance',
				'text-[clamp(2.5rem,6vw,5.5rem)]',
				accentText
			)}
		>
			{chapter.title}
		</h2>
		<p class="mt-8 max-w-2xl text-xl leading-relaxed text-pretty text-ink/80 md:text-2xl">
			{chapter.intro}
		</p>
	</div>

	<!--
		Shared viz renderer — used both by the desktop sticky `viz`
		snippet (with the active step) and by the mobile inline path
		(once per step, below its text card).

		Keeping a single source of truth here means a new viz type only
		has to be added in ONE place; both rendering paths pick it up.
	-->
	{#snippet stepViz(step: ChapterData['steps'][number], animate = true)}
		{#if step.viz?.type === 'obs-bar'}
			<ObsBarChart
				data={step.viz.data}
				title={step.viz.title}
				subtitle={step.viz.subtitle}
				unit={step.viz.unit}
				prefix={step.viz.prefix}
				layout={step.viz.layout}
				{animate}
				sourceId={step.viz.sourceId}
			/>
		{:else if step.viz?.type === 'obs-timeline'}
			<ObsTimelineChart
				series={step.viz.series}
				title={step.viz.title}
				subtitle={step.viz.subtitle}
				unit={step.viz.unit}
				domain={step.viz.domain}
				valueDomain={step.viz.valueDomain}
				sourceId={step.viz.sourceId}
			/>
		{:else if step.viz?.type === 'donut'}
			<DonutChart data={step.viz.data} label={chapter.title} />
		{:else if step.viz?.type === 'era-timeline'}
			<EraTimeline eras={step.viz.eras} title={step.viz.title} />
		{:else if step.viz?.type === 'blue-zones-map'}
			<BlueZonesMap />
		{:else if step.viz?.type === 'billion-dollar-timeline'}
			<BillionDollarTimeline />
		{:else if step.viz?.type === 'image'}
			<ImageChart
				name={step.viz.name}
				alt={step.viz.alt}
				caption={step.viz.caption}
				sourceId={step.viz.sourceId}
				credit={step.viz.credit}
				fit={step.viz.fit}
				aspect={step.viz.aspect}
				imgClass={step.viz.imgClass}
			/>
		{:else if step.stat}
			<StatCard stat={step.stat} accent={chapter.accent} />
		{/if}
	{/snippet}

	<!-- Scrollytelling body. -->
	<Scrolly
		vizSide="right"
		onActiveStep={handleActiveStep}
		class="mx-auto w-full max-w-(--container-wide) px-6 {closingSteps.length
			? 'pb-0'
			: 'pb-10 lg:pb-24 xl:pb-32'} lg:px-8"
	>
		{#snippet viz({ activeStep })}
			{@const step = visibleSteps[activeStep]}
			{@const vizKey = stepVizKey(step)}
			<!--
				Key by the rendered visual, not the text beat. Adjacent steps can
				intentionally share one chart; in that case keep it mounted so
				Observable Plot does not redraw between text screens.
			-->
			{#key vizKey}
				<div
					data-insight-source={explainer?.meta.slug && chapter.id && step?.id ? 'true' : undefined}
					data-insight-explainer={explainer?.meta.slug}
					data-insight-chapter={chapter.id}
					data-insight-step={step?.id}
					data-insight-visual={hasStepViz(step) ? 'true' : undefined}
					data-insight-content-kind={visualTakeawayKind(step)}
					data-insight-content-json={visualTakeawayContentJson(step)}
					data-insight-visual-text={visualTakeawayText(step)}
					data-insight-surrounding-text={[step?.text, visualTakeawayText(step)]
						.filter(Boolean)
						.join(' ')}
					class="animate-fade-in mx-auto flex w-full min-w-0 flex-col items-center justify-center"
				>
					{@render stepViz(step, !sharesAdjacentViz(activeStep))}
				</div>
			{/key}
		{/snippet}

		{#snippet steps({ activeStep })}
			{#each visibleSteps as step, i (step.id)}
				<Step
					id={readerPositionElementId(chapter.id, step.id)}
					isActive={i === activeStep}
					insightExplainerSlug={explainer?.meta.slug}
					insightChapterId={chapter.id}
					insightStepId={step.id}
				>
					{#if step.accentLetter}
						<p
							class="mb-3 font-display text-[clamp(5rem,14vw,11rem)] leading-none font-black select-none {accentText}"
							aria-hidden="true"
						>
							{step.accentLetter}
						</p>
					{/if}
					<!--
						richText uses <strong> for key phrases; safe — it's
						hardcoded, never user input. max-w-3xl keeps the
						measure comfortable for reading even when the
						column is wide.
					-->
					<p
						class="mx-auto max-w-3xl font-body text-xl leading-relaxed text-pretty text-ink/90 md:text-2xl [&_strong]:font-black [&_strong]:text-ink"
					>
						{@html step.richText ?? step.text}
					</p>
				</Step>

				<!--
					Mobile-only viz block. Rendered as a SEPARATE
					scroll runway after the step's text card so the
					reader gets a clean focal moment with the chart /
					quote / stat alone — the text card scrolls out
					above, the viz centres itself in the viewport,
					and only then does the next step's text come up.

					On desktop (lg+) this is hidden; the sticky viz
					column on the right handles the same content.
				-->
				{#if hasStepViz(step) && !repeatsPreviousViz(i)}
					<div
						data-scrolly-mobile-viz
						data-insight-source={explainer?.meta.slug && chapter.id && step.id ? 'true' : undefined}
						data-insight-explainer={explainer?.meta.slug}
						data-insight-chapter={chapter.id}
						data-insight-step={step.id}
						data-insight-visual="true"
						data-insight-content-kind={visualTakeawayKind(step)}
						data-insight-content-json={visualTakeawayContentJson(step)}
						data-insight-visual-text={visualTakeawayText(step)}
						data-insight-surrounding-text={[step.text, visualTakeawayText(step)]
							.filter(Boolean)
							.join(' ')}
						class="flex w-full min-w-0 items-center justify-center py-10 lg:hidden"
					>
						<div class="flex w-full min-w-0 flex-col items-center justify-center">
							{@render stepViz(step, !sharesAdjacentViz(i))}
						</div>
					</div>
				{/if}
			{/each}
		{/snippet}
	</Scrolly>

	<!--
		Closing beats — lifted out of the scrolly grid and rendered full-width
		as chapter "curtain drops" between the scrolly body and next header.
	-->
	{#if closingSteps.length}
		<div class="mx-auto w-full max-w-(--container-wide) px-6 pb-10 lg:px-8 lg:pb-24 xl:pb-32">
			{#each closingSteps as step (step.id)}
				{#if step.quote}
					<div
						data-insight-source={explainer?.meta.slug && chapter.id && step.id ? 'true' : undefined}
						data-insight-explainer={explainer?.meta.slug}
						data-insight-chapter={chapter.id}
						data-insight-step={step.id}
					>
						<QuoteBlock quote={step.quote} variant="closing" accent={chapter.accent} />
					</div>
				{:else}
					{@const closingText = step.richText ?? step.text}
					<div
						data-insight-source={explainer?.meta.slug && chapter.id && step.id ? 'true' : undefined}
						data-insight-explainer={explainer?.meta.slug}
						data-insight-chapter={chapter.id}
						data-insight-step={step.id}
						class="w-full border-t border-ink/8 py-14 lg:py-18"
					>
						<p
							class="mx-auto max-w-4xl px-6 text-center font-display text-[clamp(1.55rem,2.15vw,2.3rem)] leading-[1.18] font-black text-pretty text-ink lg:px-8 [&_strong]:text-brand-pink"
						>
							{@html closingText}
						</p>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</section>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	:global(.animate-fade-in) {
		animation: fade-in 400ms ease-out;
	}

	/* ── Blackout step effect ── */
	.chapter-section {
		transition:
			background-color 700ms ease,
			background-image 700ms ease;
	}
	.chapter-section.is-blackout {
		background: #0a0a0a !important;
		background-image: none !important;
	}

	.chapter-section.is-blackout :global([data-scrolly-step] > div) {
		background: rgba(10, 10, 10, 0.9) !important;
		border-color: rgba(245, 245, 244, 0.14) !important;
		box-shadow: none !important;
	}

	/*
	 * Flip ALL descendant text to near-white while blacked out.
	 * — `color` handles regular text
	 * — `-webkit-text-fill-color` overrides gradient-text classes that
	 *   set `text-fill-color: transparent` and `background-clip: text`
	 * — `background-image: none` removes the gradient paint on those spans
	 * We target the scrolly section and viz column specifically to avoid
	 * touching chapter header text (title/intro) which sits outside Scrolly.
	 */
	.chapter-section.is-blackout :global([data-scrolly-mobile-viz] *),
	.chapter-section.is-blackout :global([data-scrolly-mobile-viz] p),
	.chapter-section.is-blackout :global([data-scrolly-mobile-viz] span),
	.chapter-section.is-blackout :global([data-scrolly-mobile-viz] figcaption),
	.chapter-section.is-blackout :global([data-scrolly-mobile-viz] button),
	.chapter-section.is-blackout :global([data-scrolly-viz] *),
	.chapter-section.is-blackout :global([data-scrolly-viz] p),
	.chapter-section.is-blackout :global([data-scrolly-viz] span),
	.chapter-section.is-blackout :global([data-scrolly-viz] figcaption),
	.chapter-section.is-blackout :global([data-scrolly-viz] button) {
		color: rgba(245, 245, 244, 0.9) !important;
		-webkit-text-fill-color: rgba(245, 245, 244, 0.9) !important;
		background-image: none !important;
		transition:
			color 700ms ease,
			-webkit-text-fill-color 700ms ease;
	}
	.chapter-section.is-blackout :global([data-scrolly-mobile-viz] p:last-child),
	.chapter-section.is-blackout :global([data-scrolly-mobile-viz] .text-ink\/60),
	.chapter-section.is-blackout :global([data-scrolly-mobile-viz] .text-ink\/80),
	.chapter-section.is-blackout :global([data-scrolly-viz] p:last-child),
	.chapter-section.is-blackout :global([data-scrolly-viz] .text-ink\/60),
	.chapter-section.is-blackout :global([data-scrolly-viz] .text-ink\/80) {
		color: rgba(245, 245, 244, 0.55) !important;
		-webkit-text-fill-color: rgba(245, 245, 244, 0.55) !important;
	}
	/* Story column step text */
	.chapter-section.is-blackout :global([data-scrolly-story] p),
	.chapter-section.is-blackout :global([data-scrolly-story] strong) {
		color: rgba(245, 245, 244, 0.9) !important;
		-webkit-text-fill-color: rgba(245, 245, 244, 0.9) !important;
		transition:
			color 700ms ease,
			-webkit-text-fill-color 700ms ease;
	}

	.chapter-section.is-blackout :global([data-scrolly-viz] svg text),
	.chapter-section.is-blackout :global([data-scrolly-mobile-viz] svg text) {
		fill: rgba(245, 245, 244, 0.9) !important;
	}
	.chapter-section.is-blackout :global([data-scrolly-viz] svg [aria-label='grid'] line),
	.chapter-section.is-blackout :global([data-scrolly-viz] svg [aria-label='rule'] line),
	.chapter-section.is-blackout :global([data-scrolly-viz] svg [aria-label='rule'] path),
	.chapter-section.is-blackout :global([data-scrolly-mobile-viz] svg [aria-label='grid'] line),
	.chapter-section.is-blackout :global([data-scrolly-mobile-viz] svg [aria-label='rule'] line),
	.chapter-section.is-blackout :global([data-scrolly-mobile-viz] svg [aria-label='rule'] path) {
		stroke: rgba(245, 245, 244, 0.22) !important;
	}
</style>
