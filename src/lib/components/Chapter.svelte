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
	import type { Chapter as ChapterData } from '$lib/types/explainer';
	import Scrolly from '$lib/components/scrolly/Scrolly.svelte';
	import Step from '$lib/components/scrolly/Step.svelte';
	import StatCard from '$lib/components/ui/StatCard.svelte';
	import QuoteBlock from '$lib/components/ui/QuoteBlock.svelte';
	import Eyebrow from '$lib/components/ui/Eyebrow.svelte';
	import DonutChart from '$lib/components/viz/DonutChart.svelte';
	import ObsBarChart from '$lib/components/viz/ObsBarChart.svelte';
	import ObsTimelineChart from '$lib/components/viz/ObsTimelineChart.svelte';
	import ImageChart from '$lib/components/viz/ImageChart.svelte';
	import { cn } from '$lib/utils/cn';
	import { posthog } from '$lib/analytics/posthog';

	interface Props {
		chapter: ChapterData;
		index: number;
	}

	let { chapter, index }: Props = $props();

	const closingQuotes = $derived(chapter.steps.filter((s) => s.quote));

	const accentBg = $derived(
		{
			red: 'from-cream via-cream to-brand-red/10',
			amber: 'from-cream via-cream to-brand-amber/10',
			pink: 'from-cream via-cream to-brand-pink/10',
			ink: 'from-cream to-cream',
			forest: 'from-cream via-cream to-brand-forest/10'
		}[chapter.accent]
	);

	const accentText = $derived(
		{
			red: 'gradient-warning',
			amber: 'gradient-amber',
			pink: 'gradient-shock',
			ink: 'text-ink',
			forest: 'gradient-forest'
		}[chapter.accent]
	);

	let sectionEl = $state<HTMLElement | undefined>(undefined);

	$effect(() => {
		if (!sectionEl) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					posthog.capture('chapter_viewed', {
						chapter_id: chapter.id,
						chapter_number: chapter.number,
						chapter_title: chapter.title
					});
					observer.disconnect();
				}
			},
			{ threshold: 0.1 }
		);
		observer.observe(sectionEl);
		return () => observer.disconnect();
	});
</script>

<section
	bind:this={sectionEl}
	id={chapter.id}
	class={cn('relative isolate bg-linear-to-b overflow-clip', accentBg, index % 2 === 1 && 'bg-cream-soft')}
	aria-labelledby={`${chapter.id}-title`}
>
	<!-- Chapter opener: full-bleed intro before the scrolly kicks in. -->
	<div class="mx-auto w-full min-w-0 max-w-(--container-wide) px-6 pt-14 pb-8 lg:px-8 lg:pt-32 lg:pb-20">
		<Eyebrow emoji={chapter.emoji}>{chapter.eyebrow}</Eyebrow>
		<h2
			id={`${chapter.id}-title`}
			class={cn(
				'mt-4 max-w-5xl font-display font-bold text-balance leading-[1.05]',
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
	{#snippet stepViz(step: ChapterData['steps'][number])}
		{#if step.viz?.type === 'obs-bar'}
			<ObsBarChart
				data={step.viz.data}
				title={step.viz.title}
				subtitle={step.viz.subtitle}
				unit={step.viz.unit}
				prefix={step.viz.prefix}
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
		class="mx-auto w-full max-w-(--container-wide) px-6 {closingQuotes.length ? 'pb-0' : 'pb-10 lg:pb-24 xl:pb-32'} lg:px-8"
	>
		{#snippet viz({ activeStep })}
			{@const step = chapter.steps[activeStep]}
			<!--
				`{#key activeStep}` re-mounts the inner block when the
				active step changes, so the `animate-fade-in` animation
				re-runs on every beat. Without the key, the same DOM is
				reused and the fade-in only plays once per chapter load.
			-->
			{#key activeStep}
				<div class="animate-fade-in mx-auto flex w-full min-w-0 flex-col items-center justify-center">
					{@render stepViz(step)}
				</div>
			{/key}
		{/snippet}

		{#snippet steps({ activeStep })}
			{#each chapter.steps as step, i (step.id)}
				<Step isActive={i === activeStep}>
					<!--
						richText uses <strong> for key phrases; safe — it's
						hardcoded, never user input. max-w-3xl keeps the
						measure comfortable for reading even when the
						column is wide.
					-->
					<p class="mx-auto max-w-3xl font-body text-xl leading-relaxed text-pretty text-ink/90 md:text-2xl [&_strong]:font-black [&_strong]:text-ink">
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
				{#if step.viz || step.stat}
					<div
						class="flex w-full min-w-0 items-center justify-center py-10 lg:hidden"
					>
						<div class="flex w-full min-w-0 flex-col items-center justify-center">
							{@render stepViz(step)}
						</div>
					</div>
				{/if}
			{/each}
		{/snippet}
	</Scrolly>

	<!--
		Closing quotes — lifted out of the scrolly grid and rendered as
		full-bleed, centred, accent-coloured "curtain drops" between the
		end of the scrolly body and the next chapter header.
	-->
	{#if closingQuotes.length}
		<div class="mx-auto w-full max-w-(--container-wide) px-6 pb-10 lg:pb-24 xl:pb-32 lg:px-8">
			{#each closingQuotes as step (step.id)}
				<QuoteBlock
					quote={step.quote!}
					variant="closing"
					accent={chapter.accent}
				/>
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
</style>
