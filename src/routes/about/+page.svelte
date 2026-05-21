<script lang="ts">
	import { onMount } from 'svelte';
	import { decode } from 'blurhash';
	import { setActiveExplainer } from '$lib/context/explainer.svelte';
	import { site } from '$lib/data/site';
	import SEO from '$lib/components/SEO.svelte';
	import { reveal } from '$lib/attachments/reveal';

	/** Blurhash placeholder for the byline photo */
	const BLURHASH = 'CzEpQUxuR+Rj?wt7WWWC';
	const PHOTO_W = 1920;
	const PHOTO_H = 1280;

	let canvas: HTMLCanvasElement | undefined = $state();
	let imgLoaded = $state(false);

	onMount(() => {
		if (!canvas) return;
		const pixels = decode(BLURHASH, 32, 21);
		canvas.width = 32;
		canvas.height = 21;
		const ctx = canvas.getContext('2d')!;
		const imageData = ctx.createImageData(32, 21);
		imageData.data.set(pixels);
		ctx.putImageData(imageData, 0, 0);
	});

	setActiveExplainer(null);

	const description =
		'Pixel Poetry is a small side project by Marc Duby — visual essays about topics I find interesting, worrying, or difficult to stop thinking about.';
</script>

<SEO title="About" {description} canonical="/about" />

<!-- Hero -->
<section class="bg-cream pt-24 pb-16 md:pt-32 md:pb-20">
	<div class="mx-auto max-w-(--container-prose) px-6 lg:px-8">
		<p
			class="font-body text-sm font-bold tracking-[0.25em] text-brand-amber-deep uppercase"
			{@attach reveal({ y: 16 })}
		>
			About
		</p>
		<h1
			class="mt-4 font-display text-5xl leading-tight font-bold tracking-tight text-balance md:text-6xl"
			{@attach reveal({ y: 24, delay: 100 })}
		>
			Pixel Poetry
		</h1>
		<p
			class="mt-6 max-w-2xl text-xl leading-relaxed text-ink/70 md:text-2xl"
			{@attach reveal({ y: 20, delay: 200 })}
		>
			A small experiment in visual essays, slow scrolling, and trying to understand things without
			pretending the answer is already neatly waiting at the end.
		</p>
	</div>
</section>

<!-- Main content -->
<section class="bg-cream pb-24 md:pb-32">
	<div class="mx-auto max-w-(--container-prose) px-6 lg:px-8">
		<div class="space-y-16">
			<!-- The origin -->
			<div {@attach reveal({ y: 24, delay: 50 })}>
				<h2 class="font-display text-2xl font-bold text-ink">Where this comes from</h2>
				<div class="mt-5 space-y-4 text-lg leading-relaxed text-ink/75">
					<p>
						I'm Marc — a Swiss web engineer who has spent the last decade helping newsrooms turn
						complex data into stories people actually read. I joined
						<a
							href="https://www.tagesanzeiger.ch"
							target="_blank"
							rel="noopener noreferrer"
							class="text-ink underline decoration-dotted underline-offset-4 transition-colors hover:text-brand-red"
							>Tages-Anzeiger</a
						>'s data journalism team in 2015 — the early days of scrollytelling — and have been
						obsessed with the format ever since. I now lead technical architecture at
						<a
							href="https://www.thenewhumanitarian.org"
							target="_blank"
							rel="noopener noreferrer"
							class="text-ink underline decoration-dotted underline-offset-4 transition-colors hover:text-brand-red"
							>The New Humanitarian</a
						>, where I build award-winning
						<a
							href="http://thenewhumanitarian.org/interactive"
							target="_blank"
							rel="noopener noreferrer"
							class="text-ink underline decoration-dotted underline-offset-4 transition-colors hover:text-brand-red"
							>interactive investigations</a
						>
						for stories that matter.
					</p>
					<p>
						Pixel Poetry is what I do in the margins — a place to publish essays on topics I find
						genuinely alarming, fascinating, or hard to stop thinking about. There are only two
						pieces so far. That is not a strategy deck; it is just where the project is.
					</p>
				</div>
			</div>

			<!-- What it is -->
			<div {@attach reveal({ y: 24 })}>
				<h2 class="font-display text-2xl font-bold text-ink">What this is</h2>
				<div class="mt-5 space-y-4 text-lg leading-relaxed text-ink/75">
					<p>
						Each essay takes one subject — diet, longevity, the systems behind the headlines — and
						tries to stay with it for a little longer than the Internet usually allows. Chapter by
						chapter, scroll beat by scroll beat. Sometimes that means a chart. Sometimes a quote.
						Sometimes just a paragraph that needed room to breathe.
					</p>
					<p>
						I try to source the important claims and be honest about the limits. I am not claiming
						to explain everything. Mostly, I am trying to understand things in public without
						getting too high on my own certainty.
					</p>
				</div>
			</div>

			<!-- What it isn't -->
			<div {@attach reveal({ y: 24 })}>
				<h2 class="font-display text-2xl font-bold text-ink">What it isn't</h2>
				<div class="mt-5 space-y-4 text-lg leading-relaxed text-ink/75">
					<p>
						Not medical advice. Not a newsletter, at least not yet. Not a recipe site, a diet plan,
						or a supplement brand. Just essays — careful where they can be, imperfect where they
						must be, and hopefully useful enough to justify the scroll.
					</p>
				</div>
			</div>

			<!-- How it's made -->
			<div {@attach reveal({ y: 24 })}>
				<h2 class="font-display text-2xl font-bold text-ink">How it's made</h2>
				<div class="mt-5 space-y-4 text-lg leading-relaxed text-ink/75">
					<p>
						The project is built with SvelteKit. Each explainer is a self-contained data module —
						chapters, sources, terms, and image manifest live together in
						<code class="rounded bg-ink/8 px-1.5 py-0.5 font-mono text-sm text-ink"
							>src/lib/explainers/&lt;slug&gt;/</code
						>. The shared pieces — scrolly layout, charts, navigation, source sheets — are slowly
						becoming a small storytelling toolkit. Slowly is doing a lot of work in that sentence.
					</p>
					<p>
						The
						<a
							href="https://github.com/maduby/pixelpoetry-sveltekit"
							target="_blank"
							rel="noopener noreferrer"
							class="text-ink underline decoration-dotted underline-offset-4 transition-colors hover:text-brand-red"
							>source code is on GitHub</a
						>.
					</p>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Byline — full-bleed photo section -->
<section class="relative overflow-hidden" style="min-height: clamp(480px, 60vw, 760px);">
	<!-- Blurhash canvas placeholder (fades out when photo loads) -->
	<canvas
		bind:this={canvas}
		class="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
		style="image-rendering: auto; opacity: {imgLoaded ? 0 : 1};"
		aria-hidden="true"
	></canvas>

	<!-- Responsive photo -->
	<img
		srcset="
			/about/processed/aboutme-800w.webp   800w,
			/about/processed/aboutme-1200w.webp 1200w,
			/about/processed/aboutme-1920w.webp 1920w
		"
		sizes="100vw"
		src="/about/processed/aboutme-1200w.webp"
		alt="Marc Duby"
		width={PHOTO_W}
		height={PHOTO_H}
		class="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
		style="opacity: {imgLoaded ? 1 : 0};"
		onload={() => (imgLoaded = true)}
		loading="lazy"
		decoding="async"
	/>

	<!-- Gradient overlay: dark at bottom, lighter at top -->
	<div
		class="absolute inset-0"
		style="background: linear-gradient(to top, rgba(10,9,8,0.92) 0%, rgba(10,9,8,0.45) 50%, rgba(10,9,8,0.10) 100%);"
	></div>

	<!-- Content pinned to bottom -->
	<div class="relative z-10 flex h-full min-h-[inherit] flex-col justify-end">
		<div class="mx-auto w-full max-w-(--container-wide) px-6 pb-14 lg:px-8 lg:pb-20">
			<p
				class="font-body text-xs font-bold tracking-[0.22em] text-cream/40 uppercase"
				{@attach reveal({ y: 12 })}
			>
				The byline
			</p>

			<div class="mt-5 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
				<!-- Text block -->
				<div
					class="max-w-xl space-y-4 text-base leading-relaxed text-cream/80 md:text-lg"
					{@attach reveal({ y: 20, delay: 80 })}
				>
					<p>
						I'm based between Cape Town and Switzerland. When I'm not at a keyboard I'm on a trail,
						on a climbing wall, or in the water. That preference for focus and clean lines follows
						me into the work.
					</p>
					<p>
						For my full portfolio, professional background, and work at The New Humanitarian, see
						<a
							href="https://duby.io"
							target="_blank"
							rel="noopener noreferrer"
							class="text-cream underline decoration-dotted underline-offset-4 transition-colors hover:text-brand-amber"
							>duby.io</a
						>.
					</p>
					<p class="text-sm text-cream/50">
						Suggest a topic, flag a correction, or point me at a source I missed:
						<a
							href="mailto:hello@pixelpoetry.dev"
							class="text-cream/70 underline decoration-dotted underline-offset-4 transition-colors hover:text-brand-amber"
							>hello@pixelpoetry.dev</a
						>
					</p>
				</div>

				<!-- Link pills -->
				<div
					class="flex flex-wrap gap-3 md:flex-col md:items-end"
					{@attach reveal({ y: 16, delay: 160 })}
				>
					<a
						href="https://duby.io"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2 rounded-full border border-cream/25 bg-cream/5 px-5 py-2.5 text-sm font-semibold text-cream/80 backdrop-blur-sm transition-all hover:border-brand-amber/60 hover:bg-cream/10 hover:text-brand-amber"
					>
						Portfolio ↗
					</a>
					<a
						href="https://www.linkedin.com/in/marcduby/"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2 rounded-full border border-cream/25 bg-cream/5 px-5 py-2.5 text-sm font-semibold text-cream/80 backdrop-blur-sm transition-all hover:border-brand-amber/60 hover:bg-cream/10 hover:text-brand-amber"
					>
						LinkedIn ↗
					</a>
					<a
						href="https://github.com/maduby"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2 rounded-full border border-cream/25 bg-cream/5 px-5 py-2.5 text-sm font-semibold text-cream/80 backdrop-blur-sm transition-all hover:border-brand-amber/60 hover:bg-cream/10 hover:text-brand-amber"
					>
						GitHub ↗
					</a>
					<a
						href="mailto:hello@pixelpoetry.dev"
						class="inline-flex items-center gap-2 rounded-full border border-cream/25 bg-cream/5 px-5 py-2.5 text-sm font-semibold text-cream/80 backdrop-blur-sm transition-all hover:border-brand-amber/60 hover:bg-cream/10 hover:text-brand-amber"
					>
						Email
					</a>
				</div>
			</div>
		</div>
	</div>
</section>
