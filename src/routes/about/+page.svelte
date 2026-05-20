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
		'Pixel Poetry is a side project by Marc Duby — Swiss web engineer, scrollytelling practitioner, and long-time data journalist. An evidence-led essay series on the things that quietly shape modern life.';
</script>

<SEO
	title="About"
	description={description}
/>

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
			class="mt-4 font-display text-5xl font-bold leading-tight tracking-tight text-balance md:text-6xl"
			{@attach reveal({ y: 24, delay: 100 })}
		>
			Pixel Poetry
		</h1>
		<p
			class="mt-6 max-w-2xl text-xl leading-relaxed text-ink/70 md:text-2xl"
			{@attach reveal({ y: 20, delay: 200 })}
		>
			Evidence-led scrollytelling essays on the things that quietly shape modern life.
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
						>, where I build award-winning interactive investigations for stories that matter.
					</p>
					<p>
						Pixel Poetry is what I do in the margins — a place to publish essays on topics I find
						genuinely alarming or fascinating, with no editorial brief to satisfy except my own. The
						ultra-processed food piece started as a personal rabbit hole after reading Chris van
						Tulleken's book. Six weeks later it had 9 chapters, 12 data visualisations, and a
						reading time I'm mildly embarrassed about.
					</p>
				</div>
			</div>

			<!-- What it is -->
			<div {@attach reveal({ y: 24 })}>
				<h2 class="font-display text-2xl font-bold text-ink">What this is</h2>
				<div class="mt-5 space-y-4 text-lg leading-relaxed text-ink/75">
					<p>
						Each essay takes one subject — diet, longevity, the systems behind the headlines — and
						treats it like a chapter book. Chapter by chapter, scroll beat by scroll beat. The
						format borrows from long-form magazine writing and pairs it with what only a browser can
						do: charts that animate as you scroll, statistics that land like a punch when you reach
						them, a progress bar that knows where you are.
					</p>
					<p>
						Everything is sourced. Every number cites a peer-reviewed paper or published research
						review. If I can't defend a claim, it doesn't ship.
					</p>
				</div>
			</div>

			<!-- What it isn't -->
			<div {@attach reveal({ y: 24 })}>
				<h2 class="font-display text-2xl font-bold text-ink">What it isn't</h2>
				<div class="mt-5 space-y-4 text-lg leading-relaxed text-ink/75">
					<p>
						Not a blog. Not medical advice. Not a newsletter (yet). Not a recipe site, a diet plan,
						or a supplement brand. Just essays — long, careful, and built to hold up under scrutiny.
					</p>
				</div>
			</div>

			<!-- How it's made -->
			<div {@attach reveal({ y: 24 })}>
				<h2 class="font-display text-2xl font-bold text-ink">How it's made</h2>
				<div class="mt-5 space-y-4 text-lg leading-relaxed text-ink/75">
					<p>
						Open-source SvelteKit. Each explainer is a self-contained data module — chapters,
						sources, terms, and image manifest live together in
						<code
							class="rounded bg-ink/8 px-1.5 py-0.5 font-mono text-sm text-ink"
							>src/lib/explainers/&lt;slug&gt;/</code
						>. The shared engine (scrolly primitive, charts, nav, progress bar) is reused across
						every story. Observable Plot for charts, GSAP ScrollTrigger for animations,
						Tailwind&nbsp;v4 for style. Deployed to Vercel.
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
					<p class="text-cream/50 text-sm">
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
