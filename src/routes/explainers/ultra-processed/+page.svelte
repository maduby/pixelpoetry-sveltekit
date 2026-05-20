<script lang="ts">
	import { onDestroy } from 'svelte';
	import { activateExplainer } from '$lib/context/explainer.svelte';
	import { ultraProcessed, chapters, meta } from '$lib/explainers/ultra-processed';
	import Chapter from '$lib/components/Chapter.svelte';
	import EssayFooter from '$lib/components/footer/EssayFooter.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import ArrowDown from 'lucide-svelte/icons/arrow-down';
	import { reveal } from '$lib/attachments/reveal';
	import { posthog } from '$lib/analytics/posthog';

	// Register this explainer as the active one so Nav, ProgressBar, viz
	// components and SourceSheet can read its data via context. The returned
	// cleanup resets the holder on navigation.
	onDestroy(activateExplainer(ultraProcessed));
</script>

<SEO />


<!-- ============================================================
     HERO
     ============================================================ -->
<section
	class="relative isolate flex min-h-[calc(100svh-var(--nav-h,4rem))] flex-col justify-center overflow-hidden bg-cream -mb-px"
	aria-labelledby="hero-title"
>
	<!-- Decorative background gradient. -->
	<div
		aria-hidden="true"
		class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--color-brand-amber)_18%,transparent),transparent_60%),radial-gradient(ellipse_at_bottom_right,color-mix(in_oklab,var(--color-brand-pink)_18%,transparent),transparent_55%),radial-gradient(ellipse_at_bottom_left,color-mix(in_oklab,var(--color-brand-red)_18%,transparent),transparent_55%)]"
	></div>

	<div class="mx-auto w-full max-w-(--container-wide) px-6 pt-[5vh] pb-[10vh] lg:px-8 lg:py-[10vh]">
		<p
			class="font-body text-sm font-bold tracking-[0.25em] text-brand-red uppercase"
			{@attach reveal({ y: 16 })}
		>
			An evidence-led essay on ultra-processed food
		</p>

		<h1
			id="hero-title"
			class="mt-8 max-w-5xl font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-[clamp(4rem,9vw,9rem)]"
			style:min-height="1em"
			{@attach reveal({ y: 32, delay: 100 })}
		>
			The food<br />
			that <span class="inline-block gradient-warning text-balance">isn&#8217;t food.</span>
		</h1>

		<p
			class="mt-10 max-w-2xl text-xl leading-relaxed text-pretty text-ink/75 md:text-2xl"
			{@attach reveal({ y: 24, delay: 250 })}
		>
			{meta.description}
		</p>

		<div
			class="mt-16 flex flex-col items-start gap-6 sm:flex-row sm:items-center"
			{@attach reveal({ y: 24, delay: 400 })}
		>
			<a
				href={`#${chapters[0].id}`}
				class="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-body text-sm font-bold tracking-wider text-cream uppercase transition-colors hover:bg-brand-red"
				onclick={() => posthog.capture('hero_cta_clicked', { explainer: meta.slug })}
			>
				Start reading
				<ArrowDown size={18} aria-hidden="true" />
			</a>
			<p class="text-sm text-ink/60">
				{meta.chapterCount} chapters &#183; ~{meta.readTimeMin} min read
			</p>
		</div>
	</div>

	<!-- Scroll indicator — clickable, links to first chapter -->
	<a
		href={`#${chapters[0].id}`}
		aria-label="Scroll to first chapter"
		class="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer rounded-full p-3 text-ink/40 transition-colors hover:text-ink motion-safe:animate-bounce"
	>
		<ArrowDown size={32} />
	</a>
</section>

<!-- ============================================================
     CHAPTERS
     ============================================================ -->
{#each chapters as chapter, i (chapter.id)}
	<Chapter {chapter} index={i} />
{/each}

<!-- ============================================================
     CLOSING NOTE
     ============================================================ -->
<section class="bg-ink py-24 text-cream md:py-32">
	<div class="mx-auto max-w-(--container-wide) px-6 lg:px-8">
		<p
			class="max-w-3xl font-display text-4xl leading-tight text-balance md:text-6xl"
			{@attach reveal({ y: 32 })}
		>
			The case is no longer in doubt. The question is who designs the food environment next &#8212;
			and who pays if no one does.
		</p>
	</div>
</section>

<!-- ============================================================
     SOURCES & METHODOLOGY (essay-specific)
     ============================================================ -->
<EssayFooter />
