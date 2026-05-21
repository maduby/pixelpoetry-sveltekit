<script lang="ts">
	/**
	 * /explainers — deep-linkable listing of every essay. Mirrors the grid on
	 * the landing page but framed as a library index rather than a hero.
	 */
	import { setActiveExplainer } from '$lib/context/explainer.svelte';
	import { explainers } from '$lib/data/explainers';
	import ExplainerCard from '$lib/components/landing/ExplainerCard.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { absoluteUrl } from '$lib/utils/seo';
	import { reveal } from '$lib/attachments/reveal';

	setActiveExplainer(null);

	const description =
		'Browse the growing Pixel Poetry library: a small collection of visual essays by Marc Duby on food, health, longevity, and the systems around us.';

	const explainersJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: 'Pixel Poetry explainers',
		description,
		url: absoluteUrl('/explainers'),
		mainEntity: {
			'@type': 'ItemList',
			itemListElement: explainers.map((explainer, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				name: explainer.title,
				url: absoluteUrl(explainer.href),
				description: explainer.description
			}))
		}
	};
</script>

<SEO title="All explainers" {description} canonical="/explainers" jsonLd={explainersJsonLd} />

<section class="bg-cream pt-24 pb-16 md:pt-32">
	<div class="mx-auto max-w-(--container-wide) px-6 lg:px-8">
		<p
			class="font-body text-sm font-bold tracking-[0.25em] text-brand-amber-deep uppercase"
			{@attach reveal({ y: 16 })}
		>
			The library
		</p>
		<h1
			class="mt-4 max-w-4xl font-display text-5xl leading-tight font-bold tracking-tight text-balance md:text-7xl"
			{@attach reveal({ y: 24, delay: 100 })}
		>
			All explainers
		</h1>
		<p
			class="mt-6 max-w-2xl text-lg leading-relaxed text-ink/70 md:text-xl"
			{@attach reveal({ y: 24, delay: 200 })}
		>
			A small library for now: two pieces, a few unfinished ideas, and hopefully enough restraint to
			only publish the next one when it is ready.
		</p>
	</div>
</section>

<section class="bg-cream pb-24 md:pb-32">
	<div class="mx-auto max-w-(--container-wide) px-6 lg:px-8">
		<h2 class="mb-10 font-display text-2xl font-bold text-ink/80">Essays</h2>
		<div class="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
			{#each explainers as explainer, i (explainer.slug)}
				<ExplainerCard {explainer} delay={i * 80} />
			{/each}
		</div>
	</div>
</section>
