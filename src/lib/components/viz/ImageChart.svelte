<script lang="ts">
	/**
	 * <ImageChart> — portrait image with blur-up lazy loading.
	 *
	 * At build time `scripts/build-images.mjs` pre-processes source images into:
	 *   - A blurhash string (LQIP placeholder)
	 *   - Responsive WebP variants: 400w, 800w, 1200w
	 *   - A TypeScript manifest at `src/lib/data/image-manifest.ts`
	 *
	 * This component decodes the blurhash on the client and shows it as a
	 * blurred placeholder until the full image enters the viewport and loads.
	 * Falls back to a plain <img> on the server (SSR) so there's always
	 * a visible image even before JS hydrates.
	 */
	import { onMount } from 'svelte';
	import { decode } from 'blurhash';
	import type { ImageEntry } from '$lib/types/explainer';
	import { getActiveExplainer } from '$lib/context/explainer.svelte';
	import { openSourceSheet } from '$lib/context/sheet';

	const explainer = $derived(getActiveExplainer());

	interface Props {
		/** Image name — must match a key in image-manifest.ts */
		name: string;
		alt?: string;
		caption?: string;
		/** Optional source ID — renders a "Source" link below the caption. */
		sourceId?: string;
		/** Photo credit line — photographer, agency, licence, or copyright holder. */
		credit?: string;
		/**
		 * How the image fills its frame. `cover` crops to fill (editorial photo
		 * default); `contain` shows the whole image (product shots / logos with
		 * transparent backgrounds).
		 */
		fit?: 'cover' | 'contain';
		/**
		 * Frame aspect ratio. `4/5` is the editorial portrait default; `square`
		 * suits product shots; `auto` lets the image set its own height.
		 */
		aspect?: '4/5' | 'square' | 'auto';
		/** Extra Tailwind classes applied directly to the <img> element — useful for
		 * per-image optical corrections (e.g. `translate-x-3 lg:translate-x-0`). */
		imgClass?: string;
		/** Additional Tailwind classes for the wrapper */
		class?: string;
	}

	let {
		name,
		alt = '',
		caption = '',
		sourceId,
		credit,
		fit = 'cover',
		aspect = '4/5',
		imgClass = '',
		class: className = ''
	}: Props = $props();

	const aspectClass = $derived(
		aspect === 'square' ? 'aspect-square' : aspect === 'auto' ? '' : 'aspect-[4/5]'
	);
	const fitClass = $derived(fit === 'contain' ? 'object-contain p-4' : 'object-cover');
	const transparent = $derived(fit === 'contain');

	const source = $derived(sourceId ? explainer?.getSource(sourceId) : undefined);

	const entry = $derived(explainer?.getImage(name) as ImageEntry | undefined);

	// Responsive srcset string
	const srcset = $derived(
		entry
			? entry.variants.map((v) => `${v.src} ${v.width}w`).join(', ')
			: ''
	);

	// Largest available src for non-srcset <img>
	const src = $derived(entry ? entry.variants.at(-1)?.src ?? '' : '');

	// Canvas element for blurhash placeholder
	let canvasEl = $state<HTMLCanvasElement | undefined>(undefined);

	// True once the real image has finished loading
	let loaded = $state(false);

	// True when the image is in the viewport (triggers lazy load)
	let visible = $state(false);

	// IntersectionObserver for lazy loading
	onMount(() => {
		if (!entry) return;

		// Pre-populate the blurhash canvas immediately
		if (entry.blurhash && canvasEl) {
			const pixels = decode(entry.blurhash, 32, 32);
			const ctx = canvasEl.getContext('2d')!;
			const imageData = ctx.createImageData(32, 32);
			imageData.data.set(pixels);
			ctx.putImageData(imageData, 0, 0);
		}

		const observer = new IntersectionObserver(
			([e]) => { if (e.isIntersecting) { visible = true; observer.disconnect(); } },
			{ rootMargin: '200px' }
		);
		// Observe the image container
		const container = canvasEl?.parentElement ?? document.querySelector(`[data-image="${name}"]`);
		if (container) observer.observe(container);
		return () => observer.disconnect();
	});
</script>

<div class="mx-auto flex h-full w-full max-w-md flex-col items-center justify-center gap-4 {className}">
	<!--
		Image area — bounded by max-h-[60svh] so portrait images don't fill the
		entire sticky column and dwarf the surrounding text. aspect-[4/5] gives
		a balanced editorial frame regardless of source ratio.
	-->
	<div
		class="relative flex max-h-[60svh] w-full items-center justify-center overflow-hidden rounded-2xl {aspectClass} {transparent ? '' : 'bg-ink/5'}"
		data-image={name}
	>
		<!--
			Blurhash placeholder canvas (shown until image loads).
			Skipped for transparent product shots — the average-color blurhash
			would bleed around the silhouette and look like a tinted halo.
		-->
		{#if !transparent}
			<canvas
				bind:this={canvasEl}
				width="32"
				height="32"
				aria-hidden="true"
				class="absolute inset-0 h-full w-full scale-[500%] object-cover"
				class:opacity-100={!loaded}
				class:opacity-0={loaded}
				style="filter: blur(12px); transform-origin: center;"
			></canvas>
		{/if}

		<!-- Real image — only inserted into the DOM when visible (lazy) -->
		{#if entry}
			{#if visible}
				<img
					{src}
					srcset={srcset}
					sizes="(max-width: 768px) 100vw, 50vw"
					{alt}
					class="relative z-10 h-full w-full transition-opacity duration-500 {fitClass} {imgClass}"
					class:opacity-100={loaded}
					class:opacity-0={!loaded}
					loading="lazy"
					onload={() => (loaded = true)}
				/>
			{/if}
		{:else}
			<!-- No manifest entry — show placeholder icon -->
			<div class="flex flex-col items-center gap-3">
				<svg
					aria-hidden="true"
					class="text-ink/20"
					width="48"
					height="48"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<rect x="3" y="3" width="18" height="18" rx="2" />
					<circle cx="8.5" cy="8.5" r="1.5" />
					<polyline points="21 15 16 10 5 21" />
				</svg>
				<span class="text-ink/40 font-body text-xs">{alt || 'Image'}</span>
			</div>
		{/if}
	</div>

	<!-- Caption -->
	{#if caption}
		<p class="w-full font-body text-xs text-ink/50">{caption}</p>
	{/if}

	<!-- Photo credit -->
	{#if credit}
		<p class="w-full font-body text-[10px] text-ink/30">{credit}</p>
	{/if}

	<!-- Source link -->
	{#if source}
		<button
			type="button"
			onclick={() => openSourceSheet(source.id)}
			class="group flex self-start cursor-pointer items-center gap-1 text-xs font-semibold text-ink/40 transition-colors hover:text-brand-red"
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