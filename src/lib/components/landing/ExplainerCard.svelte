<script lang="ts">
	/**
	 * <ExplainerCard> — card used on the Pixel Poetry landing page (and the
	 * `/explainers` listing). Renders a published essay as a tactile, clickable
	 * tile; gracefully degrades for `in-progress` and `planned` entries with a
	 * status badge instead of a link.
	 *
	 * Cover images are looked up by name in the active explainer's image
	 * manifest. Because the landing page doesn't have an active explainer
	 * context, the card falls back to a plain `<img src={coverFallback} />`
	 * when no manifest entry is found.
	 */
	import { cn } from '$lib/utils/cn';
	import { reveal } from '$lib/attachments/reveal';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import type { ExplainerSummary } from '$lib/data/explainers';

	interface Props {
		explainer: ExplainerSummary;
		/** Optional reveal delay so a grid of cards staggers in. */
		delay?: number;
	}
	let { explainer, delay = 0 }: Props = $props();

	const isLink = $derived(explainer.status !== 'planned');

	const accentBorder = $derived(
		({
			red: 'group-hover:border-brand-red',
			amber: 'group-hover:border-brand-amber',
			pink: 'group-hover:border-brand-pink',
			ink: 'group-hover:border-ink'
		} as const)[explainer.accent]
	);

	const accentText = $derived(
		({
			red: 'text-brand-red',
			amber: 'text-brand-amber-deep',
			pink: 'text-brand-pink',
			ink: 'text-ink'
		} as const)[explainer.accent]
	);

	const statusLabel = $derived(
		explainer.status === 'in-progress'
			? 'In progress'
			: explainer.status === 'planned'
				? 'Coming soon'
				: ''
	);
</script>

{#snippet body()}
	<div
		class={cn(
			'group flex h-full flex-col overflow-hidden rounded-3xl border border-ink/10 bg-paper transition-all duration-300',
			isLink && 'cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:shadow-ink/10',
			accentBorder
		)}
	>
		<div class="relative aspect-[4/3] w-full overflow-hidden bg-ink/5">
			{#if explainer.coverFallback}
				<img
					src={explainer.coverFallback}
					alt={explainer.cover?.alt ?? `${explainer.title} cover`}
					loading="lazy"
					class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
				/>
			{:else}
				<div
					aria-hidden="true"
					class="h-full w-full bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--color-brand-amber)_25%,transparent),transparent_60%),radial-gradient(ellipse_at_bottom_right,color-mix(in_oklab,var(--color-brand-pink)_25%,transparent),transparent_55%),radial-gradient(ellipse_at_bottom_left,color-mix(in_oklab,var(--color-brand-red)_25%,transparent),transparent_55%)]"
				></div>
			{/if}

			{#if statusLabel}
				<span
					class="absolute right-4 top-4 rounded-full bg-ink/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cream"
				>
					{statusLabel}
				</span>
			{/if}
		</div>

		<div class="flex flex-1 flex-col gap-4 p-7">
			<p class={cn('font-body text-xs font-bold uppercase tracking-[0.2em]', accentText)}>
				{explainer.eyebrow}
			</p>

			<h3 class="font-display text-3xl font-bold leading-tight tracking-tight text-ink">
				{explainer.title}
			</h3>

			<p class="text-base leading-relaxed text-ink/70">
				{explainer.tagline}
			</p>

			<div class="mt-auto flex items-center justify-between border-t border-ink/10 pt-4 text-xs text-ink/50">
				<span>
					{#if explainer.readTimeMin}~{explainer.readTimeMin} min read{:else}Sources in progress{/if}
					{#if explainer.chapterCount} · {explainer.chapterCount} chapters{/if}
				</span>
				{#if isLink}
					<span
						class={cn('inline-flex items-center gap-1 font-semibold transition-transform group-hover:translate-x-0.5', accentText)}
					>
						Read <ArrowRight size={14} />
					</span>
				{/if}
			</div>
		</div>
	</div>
{/snippet}

{#if isLink}
	<a
		href={explainer.href}
		class="block h-full no-underline"
		aria-label={`Read the ${explainer.title} explainer`}
		{@attach reveal({ y: 24, delay })}
	>
		{@render body()}
	</a>
{:else}
	<div
		class="block h-full"
		aria-label={`${explainer.title} — ${statusLabel}`}
		{@attach reveal({ y: 24, delay })}
	>
		{@render body()}
	</div>
{/if}
