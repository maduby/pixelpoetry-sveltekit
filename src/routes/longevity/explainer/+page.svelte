<script lang="ts">
	/**
	 * /longevity/explainer — coming soon placeholder.
	 * Redirects readers to the topic hub while the essay is in development.
	 */
	import { setActiveExplainer } from '$lib/context/explainer.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { reveal } from '$lib/attachments/reveal';

	setActiveExplainer(null);
</script>

<SEO
	title="Longevity — Explainer (coming soon)"
	description="A chapter-by-chapter investigation into longevity science. Coming to Pixel Poetry."
/>

<section class="bg-cream pt-24 pb-16 md:pt-32 md:pb-20">
	<div class="mx-auto max-w-(--container-wide) px-6 lg:px-8">
		<p
			class="font-body text-sm font-bold tracking-[0.25em] text-brand-forest uppercase"
			{@attach reveal({ y: 16 })}
		>
			Health & ageing · In the works
		</p>
		<h1
			class="mt-4 max-w-4xl font-display text-5xl font-bold leading-tight tracking-tight text-balance md:text-7xl"
			{@attach reveal({ y: 24, delay: 100 })}
		>
			Longevity
		</h1>
		<p
			class="mt-6 max-w-2xl text-xl leading-relaxed text-ink/70 md:text-2xl"
			{@attach reveal({ y: 20, delay: 200 })}
		>
			What actually moves the needle on a longer, healthier life. One scroll at a time.
		</p>
	</div>
</section>

<section class="bg-cream pb-32">
	<div class="mx-auto max-w-(--container-wide) px-6 lg:px-8">
		<div
			class="max-w-2xl rounded-3xl border border-dashed border-brand-forest/30 bg-paper px-10 py-14"
			{@attach reveal({ y: 24 })}
		>
			<span class="text-4xl" aria-hidden="true">🌿</span>
			<h2 class="mt-6 font-display text-2xl font-bold text-ink">
				This one is still in the oven
			</h2>
			<p class="mt-4 text-base leading-relaxed text-ink/60">
				Months of reading, every claim cited, every chart hand-built. Almost ready. The full
				scrollytelling essay on longevity science — diet, exercise, sleep, the biology of ageing —
				lands here when it's done.
			</p>
			<div class="mt-8">
				<a
					href="/longevity"
					class="inline-flex items-center gap-2 rounded-full border border-brand-forest/30 px-6 py-3 text-sm font-semibold text-brand-forest transition-colors hover:bg-brand-forest/5"
				>
					← Back to Longevity
				</a>
			</div>
		</div>

		<div class="mt-12" {@attach reveal({ y: 16, delay: 100 })}>
			<a
				href="/"
				class="inline-flex items-center gap-2 text-sm font-semibold text-ink/50 transition-colors hover:text-ink"
			>
				← All topics
			</a>
		</div>
	</div>
</section>
