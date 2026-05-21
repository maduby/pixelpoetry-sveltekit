<script lang="ts">
	/**
	 * <BillionDollarTimeline> — makes $37T legible as time.
	 *
	 * The main metaphor: spend $1M every minute and the value lasts just over
	 * 70 years. A compact year-by-year ribbon is easier to feel than a GDP bar.
	 */
	import { onMount } from 'svelte';
	import { getExplainerHolder } from '$lib/context/explainer.svelte';
	import { openSourceSheet } from '$lib/context/sheet';

	const SOURCE_ID = 'scott-ellison-2021';
	const YEAR_COUNT = 70;
	const MINUTE_SPEND_MILLIONS = 1;
	const MILLION_DOLLAR_MINUTES_PER_YEAR = 525600;
	const TOTAL_MILLION_DOLLAR_MINUTES = 37000000;
	const TOTAL_TRILLIONS = 37;
	const DOTS = Array.from({ length: YEAR_COUNT }, (_, i) => 2026 + i);

	const explainerHolder = getExplainerHolder();
	const explainer = $derived(explainerHolder?.current ?? null);
	const source = $derived(explainer?.getSource(SOURCE_ID));

	let chartEl = $state<HTMLElement | undefined>(undefined);
	let progress = $state(0);
	let hasAnimated = $state(false);

	const animatedYears = $derived(Math.round(progress * YEAR_COUNT));
	const animatedMillionMinutes = $derived(Math.round(progress * TOTAL_MILLION_DOLLAR_MINUTES));
	const animatedTrillions = $derived(progress * TOTAL_TRILLIONS);
	const animatedTrillionLabel = $derived(
		progress >= 0.995
			? '~$37T'
			: `~$${animatedTrillions < 10 ? animatedTrillions.toFixed(1) : Math.round(animatedTrillions)}T`
	);

	const numberFormatter = new Intl.NumberFormat('en-US');

	function easeOutCubic(t: number) {
		return 1 - Math.pow(1 - t, 3);
	}

	function startAnimation() {
		if (hasAnimated) return;
		hasAnimated = true;

		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReducedMotion) {
			progress = 1;
			return;
		}

		const duration = 2200;
		const startedAt = performance.now();

		function tick(now: number) {
			const elapsed = Math.min(1, (now - startedAt) / duration);
			progress = easeOutCubic(elapsed);
			if (elapsed < 1) requestAnimationFrame(tick);
			else progress = 1;
		}

		requestAnimationFrame(tick);
	}

	onMount(() => {
		if (!chartEl) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					startAnimation();
					observer.disconnect();
				}
			},
			{ threshold: 0.35 }
		);

		observer.observe(chartEl);
		return () => observer.disconnect();
	});
</script>

<div
	bind:this={chartEl}
	class="mx-auto flex w-full max-w-xl flex-col gap-5 rounded-sm bg-cream/30"
	role="img"
	aria-label="$37 trillion is enough to spend one million dollars every minute for more than 70 years"
>
	<div class="space-y-3">
		<p class="font-display text-2xl leading-tight font-black text-ink md:text-3xl">
			How much is $37 trillion?
		</p>
		<p class="max-w-lg font-body text-base leading-relaxed text-ink/65">
			If you started spending <strong class="text-ink">$1 million every minute</strong>, the
			counter would keep going for more than 70 years.
		</p>
		<p class="font-display text-5xl leading-none font-black text-brand-amber-deep md:text-6xl">
			{animatedYears || 0}+ years
		</p>
	</div>

	<div
		class="relative overflow-hidden rounded-lg border border-ink/10 bg-linear-to-b from-white/70 to-brand-amber/8 p-4"
	>
		<div class="mb-3 flex items-center justify-between font-body text-xs font-bold text-ink/55">
			<span>2026</span>
			<span>2096</span>
		</div>

		<div class="relative">
			<div class="absolute top-1/2 right-0 left-0 h-px -translate-y-1/2 bg-ink/15"></div>
			<div class="grid grid-cols-[repeat(70,minmax(3px,1fr))] gap-[2px]">
				{#each DOTS as year, i (year)}
					<span
						class="relative z-10 h-10 origin-bottom rounded-full bg-brand-amber shadow-[0_0_10px_rgba(180,83,9,0.28)] transition-transform duration-300"
						title={`${year}: another ${numberFormatter.format(MILLION_DOLLAR_MINUTES_PER_YEAR)} million-dollar minutes`}
						aria-hidden="true"
						style:opacity={progress >= (i + 1) / YEAR_COUNT ? 0.34 + (i / YEAR_COUNT) * 0.58 : 0.12}
						style:transform={progress >= (i + 1) / YEAR_COUNT ? 'scaleY(1)' : 'scaleY(0.18)'}
					></span>
				{/each}
			</div>
		</div>

		<div class="mt-4 grid grid-cols-3 gap-3 border-t border-ink/10 pt-4">
			<div>
				<p class="font-display text-2xl font-black text-brand-amber-deep">
					{numberFormatter.format(MILLION_DOLLAR_MINUTES_PER_YEAR)}
				</p>
				<p class="text-xs leading-snug text-ink/55">million-dollar minutes per year</p>
			</div>
			<div>
				<p class="font-display text-2xl font-black text-brand-amber-deep">
					{numberFormatter.format(animatedMillionMinutes)}
				</p>
				<p class="text-xs leading-snug text-ink/55">million-dollar minutes in total</p>
			</div>
			<div>
				<p class="font-display text-2xl font-black text-brand-amber-deep">{animatedTrillionLabel}</p>
				<p class="text-xs leading-snug text-ink/55">estimated economic value</p>
			</div>
		</div>
	</div>

	<p class="font-body text-xs leading-relaxed text-ink/50">
		Scott and Ellison estimate the economic value of adding one year of healthy life expectancy
		across the US population. This is not a literal pot of cash: it is a way to make the estimated
		value legible. At ${MINUTE_SPEND_MILLIONS}M per minute, $37T lasts about {numberFormatter.format(
			TOTAL_MILLION_DOLLAR_MINUTES
		)} minutes, or just over 70 years.
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
