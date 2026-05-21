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
	import { absoluteUrl } from '$lib/utils/seo';
	import ArrowDown from 'lucide-svelte/icons/arrow-down';
	import { reveal } from '$lib/attachments/reveal';
	import { posthog } from '$lib/analytics/posthog';

	// Ensure no leftover explainer context from a previous navigation.
	setActiveExplainer(null);

	const publishedCount = $derived(explainers.filter((e) => e.status === 'published').length);
	const inProgressCount = $derived(explainers.filter((e) => e.status !== 'published').length);

	const homeJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: 'Pixel Poetry explainers',
		itemListElement: explainers.map((explainer, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: explainer.title,
			url: absoluteUrl(explainer.href),
			description: explainer.description
		}))
	};
</script>

<SEO jsonLd={homeJsonLd} />

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
		class="hero-rainbow pointer-events-none absolute inset-0 -z-10"
	></div>

	<div class="mx-auto w-full max-w-(--container-wide) px-6 pt-[6vh] pb-[10vh] lg:px-8 lg:py-[12vh]">
		<p
			class="font-body text-sm font-bold tracking-[0.25em] text-ink/60 uppercase"
			{@attach reveal({ y: 16 })}
		>
			A small visual essay project
		</p>

		<h1
			id="hero-title"
			class="mt-8 max-w-5xl font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-[clamp(3.5rem,8vw,8rem)]"
			{@attach reveal({ y: 32, delay: 100 })}
		>
			Things I keep<br />
			<span
				class="inline-block text-balance"
				style="background: linear-gradient(90deg, #f43f5e 0%, #f97316 22%, #eab308 44%, #22c55e 66%, #3b82f6 88%, #a855f7 100%); -webkit-background-clip: text; background-clip: text; color: transparent; padding-bottom: 0.12em;"
			>
				thinking about.
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
				{publishedCount} published so far{#if inProgressCount}
					· {inProgressCount} in the works{/if}
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

<style>
	.hero-rainbow {
		background:
			radial-gradient(
				circle at 14% 22%,
				color-mix(in oklab, var(--color-brand-pink) 18%, transparent),
				transparent 30%
			),
			radial-gradient(
				circle at 82% 18%,
				color-mix(in oklab, var(--color-brand-amber) 22%, transparent),
				transparent 32%
			),
			radial-gradient(
				circle at 20% 88%,
				color-mix(in oklab, var(--color-brand-red) 16%, transparent),
				transparent 34%
			),
			radial-gradient(circle at 72% 78%, rgb(59 130 246 / 16%), transparent 34%),
			radial-gradient(circle at 55% 54%, rgb(34 197 94 / 12%), transparent 38%),
			linear-gradient(120deg, #fff7ed 0%, #fff1f2 38%, #eef7ff 74%, #fff8e1 100%);
		background-size:
			145% 145%,
			135% 135%,
			150% 150%,
			140% 140%,
			160% 160%,
			100% 100%;
		background-position:
			0% 0%,
			100% 0%,
			0% 100%,
			100% 100%,
			50% 50%,
			0% 0%;
	}

	.hero-rainbow::before {
		content: '';
		position: absolute;
		inset: -18%;
		background: conic-gradient(
			from 210deg at 50% 50%,
			rgb(244 63 94 / 10%),
			rgb(249 115 22 / 12%),
			rgb(234 179 8 / 12%),
			rgb(34 197 94 / 10%),
			rgb(59 130 246 / 11%),
			rgb(168 85 247 / 10%),
			rgb(244 63 94 / 10%)
		);
		filter: blur(56px);
		opacity: 0.72;
		transform: rotate(0deg) scale(1.06);
	}

	@media (prefers-reduced-motion: no-preference) {
		.hero-rainbow {
			animation: hero-rainbow-drift 32s ease-in-out infinite alternate;
		}

		.hero-rainbow::before {
			animation: hero-rainbow-turn 46s linear infinite;
		}
	}

	@keyframes hero-rainbow-drift {
		0% {
			background-position:
				0% 0%,
				100% 0%,
				0% 100%,
				100% 100%,
				50% 50%,
				0% 0%;
		}
		100% {
			background-position:
				8% 5%,
				92% 8%,
				10% 90%,
				88% 84%,
				56% 46%,
				0% 0%;
		}
	}

	@keyframes hero-rainbow-turn {
		to {
			transform: rotate(360deg) scale(1.06);
		}
	}
</style>

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
				The small library
			</p>
			<h2
				class="mt-4 max-w-3xl font-display text-4xl leading-tight font-bold tracking-tight text-balance md:text-6xl"
				{@attach reveal({ y: 24, delay: 100 })}
			>
				Two essays so far. More when I have something worth saying.
			</h2>
			<p
				class="mt-6 max-w-2xl text-lg leading-relaxed text-ink/70 md:text-xl"
				{@attach reveal({ y: 24, delay: 200 })}
			>
				I am starting with topics that kept following me around: ultra-processed food, longevity,
				and the odd gap between what science says and what everyday life makes possible. The format
				is still finding itself, which is probably part of the point.
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
					What this is
				</p>
				<h2
					class="mt-6 font-display text-4xl leading-tight font-bold tracking-tight text-balance md:text-5xl"
					{@attach reveal({ y: 24, delay: 100 })}
				>
					A place to<br />think out loud.
				</h2>
			</div>

			<div class="space-y-6 text-lg leading-relaxed text-cream/70 md:text-xl lg:col-span-7">
				<p {@attach reveal({ y: 24, delay: 150 })}>
					Pixel Poetry is a small side project by
					<a
						href="https://duby.io"
						class="text-cream underline decoration-dotted underline-offset-4 transition-colors hover:text-brand-amber"
						target="_blank"
						rel="noopener noreferrer">Marc Duby</a
					>. I use it to turn topics I find hard to stop thinking about into little interactive
					essays.
				</p>
				<p {@attach reveal({ y: 24, delay: 200 })}>
					The aim is not to explain everything, or to sound like the final authority on anything. It
					is more modest than that: read a lot, follow the evidence as honestly as I can, and make
					the result a bit easier to sit with.
				</p>
				<p {@attach reveal({ y: 24, delay: 250 })}>
					There are only two explainers here so far. That feels about right. I would rather let the
					library grow slowly than fill it with things that did not quite need to exist.
				</p>
			</div>
		</div>
	</div>
</section>
