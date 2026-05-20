<script lang="ts">
	import { getActiveExplainer } from '$lib/context/explainer.svelte';
	import { openSourceSheet } from '$lib/context/sheet';
	import { cn } from '$lib/utils/cn';
	import type { Quote } from '$lib/types/explainer';

	const explainer = $derived(getActiveExplainer());

	interface Props {
		quote: Quote;
		/**
		 * `default` — compact card used inside scrolly viz column.
		 * `closing` — full-bleed chapter-closer: centred, large, accent-coloured.
		 */
		variant?: 'default' | 'closing';
		/** Chapter accent — drives the highlight colour in `closing` variant. */
		accent?: 'red' | 'amber' | 'pink' | 'ink' | 'forest';
		class?: string;
	}

	let { quote, variant = 'default', accent = 'red', class: className }: Props = $props();
	const source = $derived(quote.sourceId ? explainer?.getSource(quote.sourceId) : undefined);

	const accentColor = $derived(
		({ red: 'text-brand-red', amber: 'text-brand-amber', pink: 'text-brand-pink', ink: 'text-ink', forest: 'text-brand-forest' } as const)[accent]
	);
	const accentBorder = $derived(
		({ red: 'border-brand-red', amber: 'border-brand-amber', pink: 'border-brand-pink', ink: 'border-ink', forest: 'border-brand-forest' } as const)[accent]
	);
</script>

{#if variant === 'closing'}
	<!--
		Full-bleed chapter closer. Sits below the scrolly body, above the next
		chapter header. Centred, large type, accent-coloured quote marks — acts
		as a visual "curtain drop" at the end of each scrolly section.
	-->
	<div class="w-full border-t border-ink/8 py-20 lg:py-28">
		<figure class={cn('mx-auto max-w-4xl px-6 text-center lg:px-8', className)}>
			<blockquote
				class="font-display text-[clamp(1.75rem,4vw,3.5rem)] font-black leading-tight text-balance text-ink"
			>
				<span aria-hidden="true" class={cn('select-none', accentColor)}>"</span>{quote.text}<span
					aria-hidden="true"
					class={cn('select-none', accentColor)}>"</span
				>
			</blockquote>
			<figcaption class="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-ink/60">
				<cite class="font-semibold text-ink/70 not-italic">{quote.attribution}</cite>
				{#if source}
					<button
						type="button"
						onclick={() => openSourceSheet(source.id)}
						class={cn(
							'group flex cursor-pointer items-center gap-1 text-ink/40 transition-colors',
						accent === 'red' && 'hover:text-brand-red',
						accent === 'amber' && 'hover:text-brand-amber',
						accent === 'pink' && 'hover:text-brand-pink',
						accent === 'ink' && 'hover:text-ink',
						accent === 'forest' && 'hover:text-brand-forest'
						)}
					>
						<span>Source</span>
						<svg
							aria-hidden="true"
							class="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
							viewBox="0 0 12 12"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						><path d="M2 10 L10 2 M4 2 H10 V8" /></svg>
					</button>
				{/if}
			</figcaption>
		</figure>
	</div>
{:else}
	<!-- Default: compact card for the scrolly viz column. -->
	<figure
		class={cn(
			'mx-auto max-w-xl pt-6 pb-2 md:max-w-2xl lg:max-w-3xl',
			`border-t-4 ${accentBorder}`,
			className
		)}
	>
		<blockquote class="font-display text-3xl font-black leading-tight text-pretty md:text-4xl">
			<span aria-hidden="true" class={cn('select-none', accentColor)}>"</span>{quote.text}<span
				aria-hidden="true"
				class={cn('select-none', accentColor)}>"</span
			>
		</blockquote>
		<figcaption class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink/60">
			<cite class="font-semibold text-ink/80 not-italic">{quote.attribution}</cite>
			{#if source}
				<button
					type="button"
					onclick={() => openSourceSheet(source.id)}
					class="group flex cursor-pointer items-center gap-1 text-ink/40 transition-colors hover:text-brand-red"
				>
					<span>Source</span>
					<svg
						aria-hidden="true"
						class="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
						viewBox="0 0 12 12"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					><path d="M2 10 L10 2 M4 2 H10 V8" /></svg>
				</button>
			{/if}
		</figcaption>
	</figure>
{/if}
