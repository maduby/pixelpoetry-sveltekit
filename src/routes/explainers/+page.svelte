<script lang="ts">
	/**
	 * /explainers — deep-linkable listing of every essay. Mirrors the grid on
	 * the landing page but framed as a library index rather than a hero.
	 */
	import { setActiveExplainer } from '$lib/context/explainer.svelte';
	import { explainers } from '$lib/data/explainers';
	import ExplainerCard from '$lib/components/landing/ExplainerCard.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { reveal } from '$lib/attachments/reveal';

	setActiveExplainer(null);

	const published = $derived(explainers.filter((e) => e.status === 'published'));
	const upcoming = $derived(explainers.filter((e) => e.status !== 'published'));
</script>

<SEO title="All explainers" description="Every Pixel Poetry essay — published and in the works." />


<section class="bg-cream pb-16 pt-24 md:pt-32">
	<div class="mx-auto max-w-(--container-wide) px-6 lg:px-8">
		<p
			class="font-body text-sm font-bold tracking-[0.25em] text-brand-amber-deep uppercase"
			{@attach reveal({ y: 16 })}
		>
			The library
		</p>
		<h1
			class="mt-4 max-w-4xl font-display text-5xl font-bold leading-tight tracking-tight text-balance md:text-7xl"
			{@attach reveal({ y: 24, delay: 100 })}
		>
			All explainers
		</h1>
		<p
			class="mt-6 max-w-2xl text-lg leading-relaxed text-ink/70 md:text-xl"
			{@attach reveal({ y: 24, delay: 200 })}
		>
			Every Pixel Poetry essay — published and in the works.
		</p>
	</div>
</section>

<section class="bg-cream pb-24 md:pb-32">
	<div class="mx-auto max-w-(--container-wide) px-6 lg:px-8">
		<h2 class="mb-10 font-display text-2xl font-bold text-ink/80">Published</h2>
		<div class="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
			{#each published as explainer, i (explainer.slug)}
				<ExplainerCard {explainer} delay={i * 80} />
			{/each}
		</div>

		{#if upcoming.length}
			<h2 class="mb-10 mt-24 font-display text-2xl font-bold text-ink/80">In the works</h2>
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
				{#each upcoming as explainer, i (explainer.slug)}
					<ExplainerCard {explainer} delay={i * 80} />
				{/each}
			</div>
		{/if}
	</div>
</section>
