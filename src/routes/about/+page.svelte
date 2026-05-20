<script lang="ts">
	import { setActiveExplainer } from '$lib/context/explainer.svelte';
	import { site } from '$lib/data/site';
	import SEO from '$lib/components/SEO.svelte';
	import { reveal } from '$lib/attachments/reveal';

	setActiveExplainer(null);
</script>

<SEO title="About" description={site.longDescription} />


<section class="bg-cream pt-24 pb-24 md:pt-32 md:pb-32">
	<div class="mx-auto max-w-(--container-prose) px-6 lg:px-8">
		<p
			class="font-body text-sm font-bold tracking-[0.25em] text-brand-amber-deep uppercase"
			{@attach reveal({ y: 16 })}
		>
			About
		</p>
		<h1
			class="mt-4 font-display text-5xl font-bold leading-tight tracking-tight text-balance md:text-6xl"
			{@attach reveal({ y: 24, delay: 100 })}
		>
			Pixel Poetry
		</h1>

		<div class="prose prose-lg mt-10 max-w-none text-ink/80">
			<p {@attach reveal({ y: 20, delay: 150 })}>{site.longDescription}</p>

			<p {@attach reveal({ y: 20, delay: 200 })}>
				The format borrows from the best of long-form magazine writing — a chapter structure, pull
				quotes, hero statistics — and pairs it with the things only a web browser can do: charts
				that animate as you scroll, photography that fades up at the right moment, a progress bar
				that knows where you are.
			</p>

			<h2 {@attach reveal({ y: 20, delay: 250 })}>How it's made</h2>
			<p {@attach reveal({ y: 20, delay: 300 })}>
				The site is open-source SvelteKit. Each explainer is a self-contained data module — its
				chapters, sources, terms and image manifest live next to each other in
				<code>src/lib/explainers/&lt;slug&gt;/</code>. Shared engine code (scrolly, charts, nav,
				progress bar) is reused across every story.
			</p>

			<h2 {@attach reveal({ y: 20, delay: 350 })}>The byline</h2>
			<p {@attach reveal({ y: 20, delay: 400 })}>
				Made by
				<a href="https://duby.io" target="_blank" rel="noopener noreferrer">Marc Duby</a>. Suggest a
				topic, a correction, or a citation:
				<a href="mailto:hello@pixelpoetry.dev">hello@pixelpoetry.dev</a>.
			</p>
		</div>
	</div>
</section>
