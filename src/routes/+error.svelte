<script lang="ts">
	import { page } from '$app/state';
	import { setActiveExplainer } from '$lib/context/explainer.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { reveal } from '$lib/attachments/reveal';

	setActiveExplainer(null);

	const is404 = $derived(page.status === 404);

	const quips = [
		"The page you're looking for left to become a longevity researcher.",
		"This URL has undergone heavy processing and is no longer recognisable.",
		"Peer-reviewed, double-blind, thoroughly lost.",
		"Even our progress bar doesn't know where this one went.",
		"We searched the literature. Nothing.",
		"NOVA classification: Group 4 — ultra-missing.",
		"The scrollytelling stopped here. There is nothing left to scroll.",
		"Our data journalist is on it. Deadline: unknown.",
	];

	// Pick a stable quip based on the URL so it doesn't jump on hydration
	const quip = $derived(
		quips[
			page.url.pathname
				.split('')
				.reduce((acc, c) => acc + c.charCodeAt(0), 0) % quips.length
		]
	);
</script>

<SEO
	title={is404 ? 'Page not found' : `Error ${page.status}`}
	description="You've found the one page on Pixel Poetry that doesn't exist. Good work."
/>

<section
	class="relative flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center overflow-hidden bg-cream px-6 py-24 text-center"
>
	<!-- Giant background number -->
	<span
		class="pointer-events-none absolute inset-0 flex select-none items-center justify-center font-display text-[clamp(18rem,50vw,36rem)] font-black leading-none tracking-tighter text-ink/[0.04]"
		aria-hidden="true"
	>
		{page.status}
	</span>

	<div class="relative z-10 mx-auto max-w-xl">
		<!-- Status pill -->
		<div
			class="mb-8 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-ink/40 shadow-sm"
			{@attach reveal({ y: 12 })}
		>
			<span
				class="size-1.5 rounded-full {is404 ? 'bg-brand-red' : 'bg-brand-amber-deep'} animate-pulse"
				aria-hidden="true"
			></span>
			{is404 ? 'Not found' : `Error ${page.status}`}
		</div>

		<h1
			class="font-display text-5xl font-black leading-tight tracking-tight text-ink md:text-7xl"
			{@attach reveal({ y: 28, delay: 80 })}
		>
			{#if is404}
				Nothing<br />to see here.
			{:else}
				Something<br />went wrong.
			{/if}
		</h1>

		<p
			class="mt-6 text-lg leading-relaxed text-ink/55 md:text-xl"
			{@attach reveal({ y: 20, delay: 160 })}
		>
			{quip}
		</p>

		{#if page.error?.message && !is404}
			<p
				class="mt-4 rounded-xl border border-ink/8 bg-paper px-5 py-3 font-mono text-xs text-ink/40"
				{@attach reveal({ y: 12, delay: 220 })}
			>
				{page.error.message}
			</p>
		{/if}

		<div
			class="mt-12 flex flex-wrap items-center justify-center gap-4"
			{@attach reveal({ y: 16, delay: 260 })}
		>
			<a
				href="/"
				class="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-bold text-cream transition-all duration-200 hover:scale-[1.03] hover:bg-ink/80 active:scale-[0.98]"
			>
				← Back to safety
			</a>
			<a
				href="/ultra-processed/explainer"
				class="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-paper px-7 py-3.5 text-sm font-bold text-ink transition-all duration-200 hover:scale-[1.03] hover:border-ink/30 active:scale-[0.98]"
			>
				Read something good
			</a>
		</div>
	</div>

	<!-- Subtle bottom decoration -->
	<p
		class="absolute bottom-8 left-0 right-0 text-center font-body text-xs text-ink/20"
		{@attach reveal({ y: 0, delay: 400 })}
	>
		pixelpoetry.dev · {page.url.pathname}
	</p>
</section>
