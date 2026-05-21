<script lang="ts">
	/**
	 * /longevity — topic hub.
	 */
	import { setActiveExplainer } from '$lib/context/explainer.svelte';
	import { getExplainer } from '$lib/data/explainers';
	import SEO from '$lib/components/SEO.svelte';
	import ExplainerCard from '$lib/components/landing/ExplainerCard.svelte';
	import { absoluteUrl } from '$lib/utils/seo';
	import { reveal } from '$lib/attachments/reveal';

	setActiveExplainer(null);

	const explainer = getExplainer('longevity');
	const topicJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: 'Longevity',
		description:
			'Evidence, tools, and interactive stories on longevity science and healthier ageing.',
		url: absoluteUrl('/longevity'),
		mainEntity: explainer
			? {
					'@type': 'CreativeWork',
					name: explainer.title,
					url: absoluteUrl(explainer.href),
					description: explainer.description
				}
			: undefined
	};
</script>

<SEO
	title="Longevity"
	description="Evidence, tools, and interactive stories on longevity science and healthier ageing."
	ogImage="/explainers/longevity/images/share-image--longevity.png"
	imageAlt="Pixel Poetry longevity explainer social preview"
	canonical="/longevity"
	jsonLd={topicJsonLd}
/>

<section class="bg-cream pt-24 pb-16 md:pt-32 md:pb-20">
	<div class="mx-auto max-w-(--container-wide) px-6 lg:px-8">
		<p
			class="font-body text-sm font-bold tracking-[0.25em] text-brand-forest uppercase"
			{@attach reveal({ y: 16 })}
		>
			Health & ageing
		</p>
		<h1
			class="mt-4 max-w-4xl font-display text-5xl leading-tight font-bold tracking-tight text-balance md:text-7xl"
			{@attach reveal({ y: 24, delay: 100 })}
		>
			Longevity
		</h1>
		<p
			class="mt-6 max-w-2xl text-xl leading-relaxed text-ink/70 md:text-2xl"
			{@attach reveal({ y: 20, delay: 200 })}
		>
			What actually moves the needle on a longer, healthier life. Evidence, tools, and interactive
			stories on longevity science.
		</p>
	</div>
</section>

<section class="bg-cream pb-24 md:pb-32">
	<div class="mx-auto max-w-(--container-wide) px-6 lg:px-8">
		{#if explainer}
			<div class="max-w-md">
				<ExplainerCard {explainer} />
			</div>
		{/if}

		<div class="mt-16" {@attach reveal({ y: 16, delay: 100 })}>
			<a
				href="/"
				class="inline-flex items-center gap-2 text-sm font-semibold text-ink/50 transition-colors hover:text-ink"
			>
				← All topics
			</a>
		</div>
	</div>
</section>
