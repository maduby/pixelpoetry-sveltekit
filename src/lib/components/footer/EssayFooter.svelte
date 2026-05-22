<script lang="ts">
	/**
	 * <EssayFooter> — heavy, per-essay closing block. Renders the citations
	 * list, image credits, chapter quick nav and an inspiration credit
	 * specific to the active explainer.
	 *
	 * Rendered above the global `<Footer />` from inside each explainer's
	 * `+page.svelte`. Reads everything via the active explainer context.
	 */
	import { onMount } from 'svelte';
	import { getExplainerHolder } from '$lib/context/explainer.svelte';
	import { posthog } from '$lib/analytics/posthog';
	import type { ImageViz } from '$lib/types/explainer';

	const explainerHolder = getExplainerHolder();
	const explainer = $derived(explainerHolder?.current ?? null);

	const sourceList = $derived(
		explainer ? Object.values(explainer.sources).sort((a, b) => b.year - a.year) : []
	);

	function dedupeImageCredits(images: ImageViz[]): ImageViz[] {
		return Array.from(new Map(images.map((image) => [image.name, image])).values());
	}

	const imageCredits = $derived(
		explainer
			? dedupeImageCredits(
					explainer.chapters
						.flatMap((c) => c.steps)
						.map((s) => s.viz)
						.filter((v): v is ImageViz => v?.type === 'image')
						.filter((v) => v.credit)
				)
			: []
	);

	let footerEl = $state<HTMLElement | undefined>(undefined);

	onMount(() => {
		if (!footerEl) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					posthog.capture('article_completed', { explainer: explainer?.meta.slug });
					observer.disconnect();
				}
			},
			{ threshold: 0.1 }
		);
		observer.observe(footerEl);
		return () => observer.disconnect();
	});
</script>

{#if explainer}
	<section bind:this={footerEl} id="sources" class="border-t border-ink/10 bg-cream-soft text-ink">
		<div class="mx-auto max-w-(--container-wide) px-6 py-20 lg:px-8 lg:py-28">
			<div class="grid gap-16 lg:grid-cols-12">
				<div class="lg:col-span-5">
					<h2 class="font-display text-4xl leading-tight font-bold md:text-5xl">
						<span class="gradient-warning">Sources</span><br />
						& methodology
					</h2>
					<p class="mt-6 max-w-md text-ink/70">
						Every statistic shown in this essay is drawn from a peer-reviewed paper, an
						international research review, or the published account of an independent investigation.
						The full citation list is to the right.
					</p>
				</div>

				<div class="lg:col-span-7">
					<h3 class="font-display text-xl font-bold text-ink/80">Citations</h3>
					<ol class="mt-6 space-y-4 text-sm text-ink/70">
						{#each sourceList as source (source.id)}
							<li class="border-l-2 border-brand-amber/40 pl-4">
								<span class="block font-semibold text-ink">{source.short}</span>
								<span class="block text-ink/60">{source.full}</span>
								{#if source.url}
									<a
										href={source.url}
										target="_blank"
										rel="noopener noreferrer"
										class="mt-1 inline-block text-brand-amber-deep underline decoration-dotted underline-offset-2 hover:text-brand-red"
										onclick={() =>
											posthog.capture('source_link_clicked', {
												source_id: source.id,
												source_url: source.url
											})}
									>
										Read source ↗
									</a>
								{/if}
							</li>
						{/each}
					</ol>
				</div>
			</div>

			<!-- Image credits -->
			{#if imageCredits.length}
				<div class="mt-16 border-t border-ink/10 pt-10">
					<h3 class="font-display text-xl font-bold text-ink/80">Image credits</h3>
					<ul class="mt-6 space-y-3 text-sm text-ink/60">
						{#each imageCredits as img (img.name)}
							<li class="flex flex-col gap-0.5 border-l-2 border-ink/10 pl-4">
								<span class="font-semibold text-ink/80 italic">{img.alt || img.name}</span>
								<span>{img.credit}</span>
							</li>
						{/each}
					</ul>
					<p class="mt-6 text-xs text-ink/40">
						All images are used for editorial and educational commentary only. If you are the rights
						holder of any image and wish it to be removed or re-credited, please get in touch.
					</p>
				</div>
			{/if}

			<!-- Chapter quick nav -->
			<nav aria-label="Chapters" class="mt-16 border-t border-ink/10 pt-10">
				<div class="mb-5 flex flex-wrap items-end justify-between gap-3">
					<div>
						<p class="text-xs font-bold tracking-[0.18em] text-ink/40 uppercase">Chapters</p>
						<h3 class="mt-1 font-display text-2xl font-bold text-ink">Go to a section</h3>
					</div>
				</div>
				<ul class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
					{#each explainer.chapters as chapter (chapter.id)}
						<li>
							<a
								href={`#${chapter.id}`}
								class="group flex h-full items-center gap-3 rounded-lg border border-ink/10 bg-cream/60 px-3 py-3 text-left transition-colors hover:border-brand-amber/50 hover:bg-cream hover:text-brand-amber-deep"
							>
								{#if chapter.emoji}
									<span aria-hidden="true" class="text-lg leading-none">{chapter.emoji}</span>
								{/if}
								<span class="min-w-0">
									<span
										class="block text-[0.65rem] font-bold tracking-[0.14em] text-ink/35 uppercase"
									>
										Chapter {chapter.number}
									</span>
									<span
										class="block truncate text-sm font-bold text-ink/70 group-hover:text-brand-amber-deep"
									>
										{chapter.shortTitle ?? chapter.title}
									</span>
								</span>
							</a>
						</li>
					{/each}
				</ul>
			</nav>
		</div>
	</section>
{/if}
