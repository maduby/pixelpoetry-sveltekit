<script lang="ts">
	import { chapters, meta } from '$lib/explainers/longevity';
	import Chapter from '$lib/components/Chapter.svelte';
	import EssayFooter from '$lib/components/footer/EssayFooter.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import ArrowDown from 'lucide-svelte/icons/arrow-down';
	import { reveal } from '$lib/attachments/reveal';
	import { posthog } from '$lib/analytics/posthog';
	import EditorialSheet from '$lib/components/ui/EditorialSheet.svelte';
</script>

<SEO />

<!-- ============================================================
     HERO
     ============================================================ -->
<section
	class="relative isolate flex min-h-[calc(100svh-var(--nav-h,4rem))] flex-col justify-center overflow-hidden bg-cream -mb-px"
	aria-labelledby="hero-title"
>
	<!-- Forest/teal gradient matching longevity's green palette. -->
	<div
		aria-hidden="true"
		class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--color-brand-forest)_15%,transparent),transparent_60%),radial-gradient(ellipse_at_bottom_right,color-mix(in_oklab,var(--color-brand-forest)_10%,transparent),transparent_55%),radial-gradient(ellipse_at_bottom_left,color-mix(in_oklab,var(--color-brand-amber)_10%,transparent),transparent_55%)]"
	></div>

	<div class="mx-auto w-full max-w-(--container-wide) px-6 pt-[5vh] pb-[10vh] lg:px-8 lg:py-[10vh]">
		<p
			class="font-body text-sm font-bold tracking-[0.25em] text-brand-forest uppercase"
			{@attach reveal({ y: 16 })}
		>
			An evidence-led essay on longevity science
		</p>

		<h1
			id="hero-title"
			class="mt-8 max-w-5xl font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-[clamp(4rem,9vw,9rem)]"
			style:min-height="1em"
			{@attach reveal({ y: 32, delay: 100 })}
		>
			The life<br />
			<span class="inline-block gradient-forest text-balance">you could live.</span>
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
				class="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-body text-sm font-bold tracking-wider text-cream uppercase transition-colors hover:bg-brand-forest"
				onclick={() => posthog.capture('hero_cta_clicked', { explainer: meta.slug })}
			>
				Start reading
				<ArrowDown size={18} aria-hidden="true" />
			</a>
			<div class="flex items-center gap-3 text-sm text-ink/60">
				<span>{meta.chapterCount} chapters &#183; ~{meta.readTimeMin} min read</span>
				{#if meta.editorial}
					<span aria-hidden="true" class="text-ink/25">·</span>
					<EditorialSheet editorial={meta.editorial} slug={meta.slug} />
				{/if}
			</div>
		</div>
	</div>

	<!-- Scroll indicator -->
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
			The science is clearer than the culture admits. You have more control than you have been told — and less than the report implies. The honest answer is somewhere in the middle, and it starts on Monday.
		</p>
	</div>
</section>

<!-- ============================================================
     SOURCES & METHODOLOGY
     ============================================================ -->
<EssayFooter />
