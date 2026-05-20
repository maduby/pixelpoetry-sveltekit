<script lang="ts">
	/**
	 * Pixel Poetry landing page. A simple hero, a grid of explainer cards,
	 * and a short "what is this" section. No active explainer is registered
	 * here, so the Nav shows the site brand and the ProgressBar hides
	 * itself.
	 */
	import { setActiveExplainer } from '$lib/context/explainer.svelte';
	import { site } from '$lib/data/site';
	import { explainers } from '$lib/data/explainers';
	import ExplainerCard from '$lib/components/landing/ExplainerCard.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import ArrowDown from 'lucide-svelte/icons/arrow-down';
	import { reveal } from '$lib/attachments/reveal';
	import { posthog } from '$lib/analytics/posthog';

	// Ensure no leftover explainer context from a previous navigation.
	setActiveExplainer(null);
</script>

<SEO />


<!-- ============================================================
     HERO
     ============================================================ -->
<section
	class="relative isolate flex min-h-[calc(100svh-var(--nav-h,4rem))] flex-col justify-center overflow-hidden bg-cream"
	aria-labelledby="hero-title"
>
	<!-- Decorative background gradient — rainbow spectrum hints at the variety of stories. -->
	<div
		aria-hidden="true"
		class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklab,var(--color-brand-red)_14%,transparent),transparent_55%),radial-gradient(ellipse_at_top_right,color-mix(in_oklab,var(--color-brand-amber)_14%,transparent),transparent_55%),radial-gradient(ellipse_at_bottom_left,color-mix(in_oklab,var(--color-brand-pink)_14%,transparent),transparent_55%),radial-gradient(ellipse_at_bottom_right,#3b82f622,transparent_55%)]"
	></div>

	<div class="mx-auto w-full max-w-(--container-wide) px-6 pt-[6vh] pb-[10vh] lg:px-8 lg:py-[12vh]">
		<p
			class="font-body text-sm font-bold tracking-[0.25em] text-ink/60 uppercase"
			{@attach reveal({ y: 16 })}
		>
			Evidence-led scrollytelling essays
		</p>

		<h1
			id="hero-title"
			class="mt-8 max-w-5xl font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-[clamp(3.5rem,8vw,8rem)]"
			{@attach reveal({ y: 32, delay: 100 })}
		>
			Stories worth<br />
			<span
				class="inline-block text-balance"
				style="background: linear-gradient(90deg, #f43f5e 0%, #f97316 22%, #eab308 44%, #22c55e 66%, #3b82f6 88%, #a855f7 100%); -webkit-background-clip: text; background-clip: text; color: transparent; padding-bottom: 0.12em;"
			>
				scrolling through.
			</span>
		</h1>

		<p
			class="mt-10 max-w-2xl text-xl leading-relaxed text-pretty text-ink/75 md:text-2xl"
			{@attach reveal({ y: 24, delay: 250 })}
		>
			{site.longDescription}
		</p>

		<div
			class="mt-16 flex flex-col items-start gap-6 sm:flex-row sm:items-center"
			{@attach reveal({ y: 24, delay: 400 })}
		>
			<a
				href="#explainers"
				class="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-body text-sm font-bold tracking-wider text-cream uppercase transition-colors hover:bg-brand-red"
				onclick={() => posthog.capture('landing_cta_clicked')}
			>
				Browse explainers
				<ArrowDown size={18} aria-hidden="true" />
			</a>
			<p class="text-sm text-ink/60">
				{explainers.filter((e) => e.status === 'published').length} published · {explainers.filter(
					(e) => e.status !== 'published'
				).length} in the works
			</p>
		</div>
	</div>

	<a
		href="#explainers"
		aria-label="Browse explainers"
		class="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer rounded-full p-3 text-ink/40 transition-colors hover:text-ink motion-safe:animate-bounce"
	>
		<ArrowDown size={32} />
	</a>
</section>

<!-- ============================================================
     EXPLAINER GRID
     ============================================================ -->
<section id="explainers" class="bg-cream-soft py-24 md:py-32">
	<div class="mx-auto max-w-(--container-wide) px-6 lg:px-8">
		<div class="mb-16 lg:mb-24">
			<p
				class="font-body text-sm font-bold tracking-[0.25em] text-brand-amber-deep uppercase"
				{@attach reveal({ y: 16 })}
			>
				The library
			</p>
			<h2
				class="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-balance md:text-6xl"
				{@attach reveal({ y: 24, delay: 100 })}
			>
				One topic at a time. Done properly.
			</h2>
			<p
				class="mt-6 max-w-2xl text-lg leading-relaxed text-ink/70 md:text-xl"
				{@attach reveal({ y: 24, delay: 200 })}
			>
				Each explainer takes one big subject — diet, longevity, the systems that quietly shape our
				lives — and treats it like a chapter book. Researched from primary sources, animated where
				it earns attention, and respectful of your time.
			</p>
		</div>

		<div class="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
			{#each explainers as explainer, i (explainer.slug)}
				<ExplainerCard {explainer} delay={i * 80} />
			{/each}
		</div>
	</div>
</section>

<!-- ============================================================
     ABOUT / WHAT IS PIXEL POETRY
     ============================================================ -->
<section class="bg-ink py-24 text-cream md:py-32">
	<div class="mx-auto max-w-(--container-wide) px-6 lg:px-8">
		<div class="grid gap-12 lg:grid-cols-12 lg:gap-20">
			<div class="lg:col-span-5">
				<p
					class="font-body text-sm font-bold tracking-[0.25em] text-brand-amber uppercase"
					{@attach reveal({ y: 16 })}
				>
					What is this
				</p>
				<h2
					class="mt-6 font-display text-4xl font-bold leading-tight tracking-tight text-balance md:text-5xl"
					{@attach reveal({ y: 24, delay: 100 })}
				>
					Slow journalism,<br />pretty fast to read.
				</h2>
			</div>

			<div class="space-y-6 text-lg leading-relaxed text-cream/70 md:text-xl lg:col-span-7">
				<p {@attach reveal({ y: 24, delay: 150 })}>
					Pixel Poetry is a place to publish the kind of stories that get lost in headlines: the
					ones that need a chart, a quote, a chapter, and a quiet moment of scroll to land.
				</p>
				<p {@attach reveal({ y: 24, delay: 200 })}>
					Every claim is sourced. Every chart is built from peer-reviewed data. Every animation
					earns its place — or it doesn't ship.
				</p>
				<p {@attach reveal({ y: 24, delay: 250 })}>
					Made by
					<a
						href="https://duby.io"
						class="text-cream underline decoration-dotted underline-offset-4 transition-colors hover:text-brand-amber"
						target="_blank"
						rel="noopener noreferrer">Marc Duby</a
					>
					 — using SvelteKit, Tailwind, GSAP, and a lot of late nights.
				</p>
			</div>
		</div>
	</div>
</section>
