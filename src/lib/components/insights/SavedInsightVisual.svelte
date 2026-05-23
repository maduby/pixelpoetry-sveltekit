<script lang="ts">
	import BarChart from '$lib/components/viz/BarChart.svelte';
	import BubbleChart from '$lib/components/viz/BubbleChart.svelte';
	import DonutChart from '$lib/components/viz/DonutChart.svelte';
	import EraTimeline from '$lib/components/viz/EraTimeline.svelte';
	import LineChart from '$lib/components/viz/LineChart.svelte';
	import ObsBarChart from '$lib/components/viz/ObsBarChart.svelte';
	import ObsTimelineChart from '$lib/components/viz/ObsTimelineChart.svelte';
	import BillionDollarTimeline from '$lib/components/viz/longevity/BillionDollarTimeline.svelte';
	import BlueZonesMap from '$lib/components/viz/longevity/BlueZonesMap.svelte';
	import StatCard from '$lib/components/ui/StatCard.svelte';
	import { chapters as longevityChapters } from '$lib/explainers/longevity/chapters';
	import { chapters as ultraProcessedChapters } from '$lib/explainers/ultra-processed/chapters';
	import type { Chapter, Step } from '$lib/types/explainer';

	interface SavedInsightVisualInput {
		explainerSlug: string;
		chapterId: string;
		stepId: string;
		contentKind: string;
	}

	interface Props {
		insight: SavedInsightVisualInput;
	}

	let { insight }: Props = $props();

	const CHAPTERS_BY_EXPLAINER: Record<string, Chapter[]> = {
		longevity: longevityChapters,
		'ultra-processed': ultraProcessedChapters
	};

	function chapterForInsight(value: SavedInsightVisualInput): Chapter | undefined {
		return CHAPTERS_BY_EXPLAINER[value.explainerSlug]?.find(
			(chapter) => chapter.id === value.chapterId
		);
	}

	function stepForInsight(value: SavedInsightVisualInput): Step | undefined {
		return chapterForInsight(value)?.steps.find((step) => step.id === value.stepId);
	}

	const chapter = $derived(chapterForInsight(insight));
	const step = $derived(stepForInsight(insight));
	const viz = $derived(step?.viz);
	const stat = $derived(step?.stat);
	const shouldRender = $derived(
		insight.contentKind !== 'text' && insight.contentKind !== 'image' && (viz || stat)
	);
</script>

{#if shouldRender}
	<div class="mt-6 overflow-hidden rounded-lg border border-ink/10 bg-paper p-4 md:p-5">
		<div class="mx-auto w-full max-w-4xl">
			{#if viz?.type === 'bar'}
				<BarChart
					data={viz.data}
					label={chapter?.title ?? 'Saved bar chart'}
					yearStart={viz.yearStart}
					yearEnd={viz.yearEnd}
					stepProgress={1}
				/>
			{:else if viz?.type === 'bubble'}
				<BubbleChart
					data={viz.data}
					label={chapter?.title ?? 'Saved bubble chart'}
					stepProgress={1}
				/>
			{:else if viz?.type === 'line'}
				<LineChart
					series={viz.data}
					label={chapter?.title ?? 'Saved line chart'}
					stepProgress={1}
					activeStep={0}
				/>
			{:else if viz?.type === 'donut'}
				<DonutChart data={viz.data} label={chapter?.title ?? 'Saved donut chart'} />
			{:else if viz?.type === 'obs-bar'}
				<ObsBarChart
					data={viz.data}
					title={viz.title}
					subtitle={viz.subtitle}
					unit={viz.unit}
					prefix={viz.prefix}
					layout={viz.layout}
					animate={false}
				/>
			{:else if viz?.type === 'obs-timeline'}
				<ObsTimelineChart
					series={viz.series}
					title={viz.title}
					subtitle={viz.subtitle}
					unit={viz.unit}
					domain={viz.domain}
					valueDomain={viz.valueDomain}
				/>
			{:else if viz?.type === 'era-timeline'}
				<EraTimeline eras={viz.eras} title={viz.title} />
			{:else if viz?.type === 'blue-zones-map'}
				<BlueZonesMap />
			{:else if viz?.type === 'billion-dollar-timeline'}
				<BillionDollarTimeline />
			{:else if stat}
				<StatCard {stat} accent={chapter?.accent ?? 'red'} manualTrigger />
			{/if}
		</div>
	</div>
{/if}
