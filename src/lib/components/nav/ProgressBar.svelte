<script lang="ts">
	/**
	 * <ProgressBar> — fixed thin reading-progress bar pinned just under <Nav>.
	 *
	 * - Overall fill: a brand gradient grows from 0–100% based on how far the
	 *   user has scrolled through the document.
	 * - Markers: one dot per chapter, positioned at the chapter section's
	 *   actual offsetTop. Each is a click target that smooth-scrolls to the
	 *   chapter (browser-native, honours scroll-margin if you set it).
	 * - Active state: the chapter whose section currently dominates the
	 *   viewport gets a larger, branded dot + `aria-current="location"`.
	 * - Visited state: dots behind the progress fill flip to ink (read);
	 *   dots ahead stay cream (unread).
	 * - Hover/focus reveals a tooltip — rendered as a fixed-position sibling
	 *   so it's never constrained by the 3px bar container.
	 *
	 * Reduced motion: the global `prefers-reduced-motion` rule in app.css
	 * already collapses the bar's width transition; nothing else to do.
	 */
	import { onMount } from 'svelte';
	import { Spring, prefersReducedMotion } from 'svelte/motion';
	import { DragGesture } from '@use-gesture/vanilla';
	import { getExplainerHolder } from '$lib/context/explainer.svelte';
	import { getTheme } from '$lib/utils/explainer-theme';
	import { cn } from '$lib/utils/cn';
	import { posthog } from '$lib/analytics/posthog';

	const explainerHolder = getExplainerHolder();
	const explainer = $derived(explainerHolder?.current ?? null);
	const chapters = $derived(explainer?.chapters ?? []);
	const theme = $derived(getTheme(explainer?.meta.accent));

	interface Marker {
		id: string;
		title: string;
		eyebrow: string;
		description: string;
		number: number;
		/** 0–1 fraction of scroll progress at which this marker sits. */
		position: number;
	}

	// -----------------------------------------------------------------------
	// State
	// -----------------------------------------------------------------------
	let progress = $state(0);
	let activeId = $state<string | null>(null);
	let hoveredId = $state<string | null>(null);
	let scrubMarkerId = $state<string | null>(null);
	let isScrubbing = $state(false);
	let isPageScrolling = $state(false);
	let markers = $state<Marker[]>([]);

	/** Bar element — used to get pixel-accurate left offset and width. */
	let barEl = $state<HTMLElement | undefined>(undefined);
	let barLeft = $state(0);
	let barWidth = $state(0);
	let viewportWidth = $state(0);
	let suppressClickUntil = 0;

	const scrubProgress = new Spring(0, {
		stiffness: 0.34,
		damping: 0.72,
		precision: 0.001
	});

	const visualProgress = $derived(isScrubbing ? scrubProgress.current : progress);
	const visibleTooltipId = $derived(isPageScrolling ? null : isScrubbing ? scrubMarkerId : hoveredId);

	// -----------------------------------------------------------------------
	// Helpers
	// -----------------------------------------------------------------------
	function computeProgress() {
		const doc = document.documentElement;
		const max = doc.scrollHeight - doc.clientHeight;
		progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
	}

	function computeMarkers() {
		const doc = document.documentElement;
		const max = doc.scrollHeight - doc.clientHeight;
		// Inset the very first/last markers so they don't crowd the bar edges.
		const minPos = 0.02;
		const maxPos = 0.985;

		markers = chapters.map((c, i) => {
			const el = document.getElementById(c.id);
			const offsetTop = el?.offsetTop ?? 0;
			const fallback = (i + 1) / (chapters.length + 1);
			const raw = max > 0 ? offsetTop / max : fallback;
			const position = Math.min(maxPos, Math.max(minPos, raw));
			return {
				id: c.id,
				title: c.title,
				eyebrow: c.eyebrow,
				description: c.intro,
				number: c.number,
				position
			};
		});
	}

	/** Measure bar's screen position so we can position tooltips pixel-accurately. */
	function measureBar() {
		if (!barEl) return;
		const rect = barEl.getBoundingClientRect();
		barLeft = rect.left;
		barWidth = rect.width;
		viewportWidth = window.innerWidth;
	}

	/** Returns the pixel x-position of the dot center on screen. */
	function dotCenterPx(marker: Marker): number {
		return barLeft + marker.position * barWidth;
	}

	function progressFromClientX(clientX: number): number {
		if (barWidth <= 0) return progress;
		return Math.min(1, Math.max(0, (clientX - barLeft) / barWidth));
	}

	function markerNearestProgress(nextProgress: number): Marker | null {
		if (markers.length === 0) return null;
		return markers.reduce((nearest, marker) =>
			Math.abs(marker.position - nextProgress) < Math.abs(nearest.position - nextProgress)
				? marker
				: nearest
		);
	}

	function updateScrub(nextProgress: number) {
		const marker = markerNearestProgress(nextProgress);
		scrubMarkerId = marker?.id ?? null;
		void scrubProgress.set(nextProgress, { instant: prefersReducedMotion.current });
	}

	function scrollToMarker(marker: Marker) {
		const el = document.getElementById(marker.id);
		if (!el) return;

		activeId = marker.id;
		el.scrollIntoView({ behavior: prefersReducedMotion.current ? 'auto' : 'smooth', block: 'start' });
		history.replaceState(null, '', `#${marker.id}`);

		posthog.capture('progress_bar_chapter_clicked', {
			explainer_slug: explainer?.meta.slug,
			chapter_id: marker.id,
			chapter_number: marker.number,
			chapter_title: marker.title,
			source: 'scrub'
		});
	}

	function tooltipCenterPx(marker: Marker): number {
		const rawCenter = isScrubbing ? barLeft + scrubProgress.current * barWidth : dotCenterPx(marker);
		const tooltipWidth = Math.min(256, Math.max(0, viewportWidth - 24));
		const half = tooltipWidth / 2;
		const min = half + 12;
		const max = viewportWidth - half - 12;

		if (max <= min) return viewportWidth / 2;
		return Math.min(max, Math.max(min, rawCenter));
	}

	function tooltipLocalLeftPx(marker: Marker): number {
		return tooltipCenterPx(marker) - barLeft;
	}

	function progressScrub(node: HTMLElement) {
		const gesture = new DragGesture(
			node,
			({ active, elapsedTime, event, first, last, movement, tap, xy }) => {
				if (markers.length === 0) return;
				if (event.cancelable && active) event.preventDefault();

				if (first) {
					measureBar();
					hoveredId = null;
					isScrubbing = true;
					void scrubProgress.set(progressFromClientX(xy[0]), { instant: true });
				}

				updateScrub(progressFromClientX(xy[0]));

				if (last) {
					const marker = scrubMarkerId ? markers.find((m) => m.id === scrubMarkerId) : null;
					const travelled = Math.hypot(movement[0], movement[1]);
					const shouldDrop = Boolean(marker) && (!tap || travelled > 4 || elapsedTime > 180);

					isScrubbing = false;
					scrubMarkerId = null;

					if (shouldDrop || travelled > 4) suppressClickUntil = Date.now() + 350;
					if (shouldDrop && marker) scrollToMarker(marker);
				}
			},
			{
				axis: 'x',
				eventOptions: { passive: false },
				pointer: { capture: true, touch: true },
				preventScroll: 120,
				preventScrollAxis: 'y',
				threshold: [2, 6],
				triggerAllEvents: true
			}
		);

		return {
			destroy() {
				gesture.destroy();
			}
		};
	}

	// -----------------------------------------------------------------------
	// Lifecycle
	// -----------------------------------------------------------------------

	// Scroll + resize listeners — mounted once, always active.
	onMount(() => {
		let rafId = 0;
		let scrollEndTimer = 0;

		const onScroll = () => {
			if (!isScrubbing) {
				isPageScrolling = true;
				hoveredId = null;
				scrubMarkerId = null;
				if (scrollEndTimer) window.clearTimeout(scrollEndTimer);
				scrollEndTimer = window.setTimeout(() => {
					isPageScrolling = false;
					scrollEndTimer = 0;
				}, 180);
			}
			if (rafId) return;
			rafId = requestAnimationFrame(() => {
				computeProgress();
				rafId = 0;
			});
		};

		const onResize = () => {
			measureBar();
			computeMarkers();
			computeProgress();
		};

		measureBar();
		computeProgress();

		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onResize);

		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onResize);
			if (rafId) cancelAnimationFrame(rafId);
			if (scrollEndTimer) window.clearTimeout(scrollEndTimer);
		};
	});

	/**
	 * Re-runs whenever `chapters` changes — covers both fresh page loads and
	 * client-side navigation into or away from an explainer route.
	 *
	 * `$effect` fires after Svelte has updated the DOM, so chapter <section>
	 * elements are already present when this runs.
	 */
	$effect(() => {
		if (chapters.length === 0) {
			markers = [];
			activeId = null;
			hoveredId = null;
			scrubMarkerId = null;
			isScrubbing = false;
			return;
		}

		// Compute initial marker positions immediately (DOM is ready).
		measureBar();
		computeMarkers();
		computeProgress();

		// Re-measure after fonts/images settle and GSAP shifts layout.
		const settleTimer = window.setTimeout(() => {
			measureBar();
			computeMarkers();
			computeProgress();
		}, 500);

		// Track which chapter is in the viewport.
		const sections = chapters
			.map((c) => document.getElementById(c.id))
			.filter((el): el is HTMLElement => el !== null);

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries.filter((e) => e.isIntersecting);
				if (visible.length === 0) return;
				visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
				activeId = visible[0].target.id;
			},
			{ rootMargin: '-40% 0px -40% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
		);
		sections.forEach((s) => observer.observe(s));

		return () => {
			window.clearTimeout(settleTimer);
			observer.disconnect();
		};
	});
</script>

<!-- The bar only appears on explainer routes where a chapter list exists. -->
{#if chapters.length}
	<!-- The bar lives directly below the fixed 64px Nav. -->
	<div class="pointer-events-none fixed inset-x-0 top-16 z-50" role="presentation">
		<!-- Constrained to the same max-width as the page content -->
		<div class="mx-auto max-w-(--container-wide) px-6 lg:px-8">
			<!-- bind:this so we can measure the bar's pixel position on screen -->
			<div bind:this={barEl} class="relative h-[3px] rounded-full bg-ink/10">
				<!-- Fill: percentage of the bar element (not viewport) -->
				<div
					class="absolute inset-y-0 left-0 rounded-full transition-[width] duration-150 ease-out {theme.barGradient}"
					style:width="{(visualProgress * 100).toFixed(2)}%"
				></div>

				<!-- Markers — nav is absolute/inset-0 so % left = % of bar width -->
				<nav
					use:progressScrub
					aria-label="Chapter progress"
					class={cn(
						'pointer-events-auto absolute inset-x-0 top-1/2 h-11 -translate-y-1/2 touch-pan-y cursor-grab',
						isScrubbing && 'cursor-grabbing'
					)}
				>
					{#if isScrubbing}
						<span
							class={cn(
								'pointer-events-none absolute top-1/2 z-20 block size-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-[5px] transition-transform duration-150',
								theme.activeDot
							)}
							style:left="{(scrubProgress.current * 100).toFixed(2)}%"
							aria-hidden="true"
						></span>
					{/if}

					{#each markers as marker (marker.id)}
						{@const reached = visualProgress >= marker.position - 0.005}
						{@const isActive = (isScrubbing ? scrubMarkerId : activeId) === marker.id}
						{@const isHovered = visibleTooltipId === marker.id}

						<!-- Dot anchor — left is a % of the nav (which = bar width) -->
						<a
							href={`#${marker.id}`}
							class="group absolute top-1/2 -translate-x-1/2 -translate-y-1/2 outline-none"
							style:left="{(marker.position * 100).toFixed(2)}%"
							aria-current={isActive ? 'location' : undefined}
							aria-label={`${marker.eyebrow}: ${marker.title}`}
							onclick={(event) => {
								if (Date.now() < suppressClickUntil) {
									event.preventDefault();
									return;
								}

								posthog.capture('progress_bar_chapter_clicked', {
									explainer_slug: explainer?.meta.slug,
									chapter_id: marker.id,
									chapter_number: marker.number,
									chapter_title: marker.title,
									source: 'click'
								});
							}}
							onmouseenter={() => (hoveredId = marker.id)}
							onmouseleave={() => (hoveredId = null)}
							onfocus={() => (hoveredId = marker.id)}
							onblur={() => (hoveredId = null)}
						>
							<span
								class={cn(
									'block rounded-full border-2 transition-all duration-200',
									isActive
										? `size-4 ${theme.activeDot}`
										: reached
											? 'size-2.5 border-ink bg-ink'
											: 'size-2.5 border-ink/40 bg-cream',
									`group-hover:scale-125 group-focus-visible:scale-125 group-focus-visible:ring-2 ${theme.focusRing} group-focus-visible:ring-offset-2`
								)}
								aria-hidden="true"
							></span>
						</a>

						<!-- Tooltip — shown only on hover/focus, perfectly centered under the dot -->
						{#if isHovered}
							<span
								class="pointer-events-none absolute z-50 -translate-x-1/2 rounded-md bg-ink px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-cream shadow-lg"
								style:width="min(16rem, calc(100vw - 1.5rem))"
								style:left="{tooltipLocalLeftPx(marker)}px"
								style:top="30px"
								aria-hidden="true"
							>
								<span class="block whitespace-nowrap">
									<span class={theme.tooltipNumber}
										>{marker.number.toString().padStart(2, '0')}</span
									>
									<span class="ml-1">{marker.title}</span>
								</span>
								<span
									class="mt-1 hidden text-xs leading-snug font-medium tracking-normal text-cream/70 md:block"
								>
									{marker.description}
								</span>
							</span>
						{/if}
					{/each}
				</nav>
			</div>
		</div>
	</div>
{/if}
