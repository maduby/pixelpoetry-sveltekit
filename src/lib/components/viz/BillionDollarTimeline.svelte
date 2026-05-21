<script lang="ts">
	/**
	 * <BillionDollarTimeline> — makes $37T legible as time.
	 *
	 * The main metaphor: spend $1B every day and the money lasts just over a
	 * century. A compact year-by-year ribbon is easier to feel than a GDP bar.
	 */
	import { getActiveExplainer } from '$lib/context/explainer.svelte';
	import { openSourceSheet } from '$lib/context/sheet';

	const SOURCE_ID = 'scott-ellison-2021';
	const YEAR_COUNT = 101;
	const DAILY_SPEND_BILLIONS = 1;
	const DOTS = Array.from({ length: YEAR_COUNT }, (_, i) => 2026 + i);

	const explainer = $derived(getActiveExplainer());
	const source = $derived(explainer?.getSource(SOURCE_ID));
</script>

<div
	class="mx-auto flex w-full max-w-xl flex-col gap-5 rounded-sm bg-cream/30"
	role="img"
	aria-label="$37 trillion is enough to spend one billion dollars every day for 101 years"
>
	<div class="space-y-2">
		<p class="font-display text-2xl leading-tight font-black text-ink md:text-3xl">
			$1B a day. For 101 years.
		</p>
		<p class="max-w-md font-body text-sm leading-relaxed text-ink/60">
			Scott and Ellison's $37T estimate is easier to feel as time: one billion dollars, every single
			day, from now into the next century.
		</p>
	</div>

	<div
		class="relative overflow-hidden rounded-lg border border-ink/10 bg-linear-to-b from-white/70 to-brand-amber/8 p-4"
	>
		<div class="mb-3 flex items-center justify-between font-body text-xs font-bold text-ink/55">
			<span>2026</span>
			<span>2127</span>
		</div>

		<div class="relative">
			<div class="absolute top-1/2 right-0 left-0 h-px -translate-y-1/2 bg-ink/15"></div>
			<div class="grid grid-cols-[repeat(101,minmax(3px,1fr))] gap-[2px]">
				{#each DOTS as year, i}
					<span
						class="relative z-10 h-10 rounded-full bg-brand-amber shadow-[0_0_10px_rgba(180,83,9,0.28)]"
						title={`${year}: another $365B spent`}
						aria-hidden="true"
						style:opacity={0.34 + (i / YEAR_COUNT) * 0.58}
					></span>
				{/each}
			</div>
		</div>

		<div class="mt-4 grid grid-cols-3 gap-3 border-t border-ink/10 pt-4">
			<div>
				<p class="font-display text-2xl font-black text-brand-amber-deep">365</p>
				<p class="text-xs leading-snug text-ink/55">billion-dollar days per year</p>
			</div>
			<div>
				<p class="font-display text-2xl font-black text-brand-amber-deep">{YEAR_COUNT}</p>
				<p class="text-xs leading-snug text-ink/55">years before the counter stops</p>
			</div>
			<div>
				<p class="font-display text-2xl font-black text-brand-amber-deep">~37T</p>
				<p class="text-xs leading-snug text-ink/55">for one extra healthy year</p>
			</div>
		</div>
	</div>

	<div class="rounded-sm border-l-4 border-brand-amber bg-brand-amber/10 px-4 py-3">
		<p class="font-body text-sm leading-relaxed text-ink/70">
			The emotional anchor is not the money. It is one extra healthy year across an entire
			population.
		</p>
	</div>

	<p class="font-body text-xs text-ink/50">
		At {DAILY_SPEND_BILLIONS} billion dollars per day, $37 trillion lasts about 37,000 days: just over
		101 years.
	</p>

	{#if source}
		<button
			type="button"
			onclick={() => openSourceSheet(source.id)}
			class="group flex w-fit cursor-pointer items-center gap-1 text-sm font-semibold text-ink/40 transition-colors hover:text-brand-red"
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
			>
				<path d="M2 10 L10 2 M4 2 H10 V8" />
			</svg>
		</button>
	{/if}
</div>
