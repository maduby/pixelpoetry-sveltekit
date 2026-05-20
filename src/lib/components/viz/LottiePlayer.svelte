<script lang="ts">
	/**
	 * <LottiePlayer> — Lottie animation renderer for scrollytelling.
	 *
	 * Two modes:
	 *   "ambient"  — Lottie plays on loop at reduced opacity, subtle background
	 *                effect. position:absolute so it sits behind page content.
	 *   "scrub"   — scroll-driven playback. stepProgress (0–1) maps to
	 *                animation duration. The animation is centered and fills
	 *                the container without a white background.
	 *
	 * SSR: guarded — lottie-web requires browser DOM.
	 */
	import lottie from 'lottie-web';
	import { onMount } from 'svelte';
	import { cn } from '$lib/utils/cn';

	interface Props {
		/** Path to the Lottie JSON file (e.g. '/explainers/ultra-processed/animations/Food.json') */
		src: string;
		/** Playback mode */
		mode?: 'ambient' | 'scrub';
		/** For scrub mode: 0–1 progress drives animation position */
		stepProgress?: number;
		/** CSS class applied to the container */
		class?: string;
	}

	let { src, mode = 'ambient', stepProgress = 0, class: className }: Props = $props();

	let containerEl = $state<HTMLDivElement | undefined>(undefined);
	let anim = $state<ReturnType<typeof lottie.loadAnimation> | null>(null);

	let prefersReducedMotion = $derived(
		typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
	);

	onMount(() => {
		if (!containerEl) return;
		const ro = new ResizeObserver(() => { if (anim) anim.resize(); });
		ro.observe(containerEl);
		return () => ro.disconnect();
	});

	$effect(() => {
		if (!containerEl || typeof window === 'undefined') return;
		if (anim) { anim.destroy(); anim = null; }

		anim = lottie.loadAnimation({
			container: containerEl,
			renderer: 'svg',
			loop: false,
			autoplay: mode === 'ambient' && !prefersReducedMotion,
			path: src
		});

		// Ambient: ping-pong loop
		if (mode === 'ambient' && !prefersReducedMotion) {
			anim.addEventListener('enterFrame', () => {
				if (!anim || mode !== 'ambient' || prefersReducedMotion) return;
				const f = anim.currentFrame;
				const ep = anim.totalFrames;
				if (f >= ep - 1) { anim.setDirection(-1); anim.play(); }
				else if (f <= 0) { anim.setDirection(1); anim.play(); }
			});
		}
	});

	// Scrub mode: map stepProgress → frame
	$effect(() => {
		if (mode !== 'scrub' || !anim) return;
		anim.goToAndStop(stepProgress * anim.totalFrames, true);
	});
</script>

<!--
	Ambient: absolute/inset-0 so it sits behind content, 40% opacity for subtlety.
	Scrub:  flex-centered, transparent bg, full container — no white body, no aspect-ratio constraint.
-->
<div
	bind:this={containerEl}
	class={cn(
		'relative overflow-hidden',
		mode === 'ambient' && 'absolute inset-0 opacity-40',
		mode === 'scrub' && 'flex h-full w-full items-center justify-center',
		className
	)}
	role="img"
	aria-label="Animated illustration"
></div>