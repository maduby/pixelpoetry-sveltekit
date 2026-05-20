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
	import { getActiveExplainer } from '$lib/context/explainer.svelte';
	import { cn } from '$lib/utils/cn';
	import { posthog } from '$lib/analytics/posthog';

	const explainer = $derived(getActiveExplainer());
	const chapters = $derived(explainer?.chapters ?? []);

	interface Marker {
		id: string;
		title: string;
		eyebrow: string;
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
	let markers = $state<Marker[]>([]);

	/** Bar element — used to get pixel-accurate left offset and width. */
	let barEl = $state<HTMLElement | undefined>(undefined);
	let barLeft = $state(0);
	let barWidth = $state(0);

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
			return { id: c.id, title: c.title, eyebrow: c.eyebrow, number: c.number, position };
		});
	}

	/** Measure bar's screen position so we can position tooltips pixel-accurately. */
	function measureBar() {
		if (!barEl) return;
		const rect = barEl.getBoundingClientRect();
		barLeft = rect.left;
		barWidth = rect.width;
	}

	/** Returns the pixel x-position of the dot center on screen. */
	function dotCenterPx(marker: Marker): number {
		return barLeft + marker.position * barWidth;
	}

	// -----------------------------------------------------------------------
	// Lifecycle
	// -----------------------------------------------------------------------
	onMount(() => {
		let rafId = 0;

		const onScroll = () => {
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
		computeMarkers();
		computeProgress();

		// Re-measure after fonts/images settle (scroll heights finalise).
		const settleTimer = window.setTimeout(() => {
			measureBar();
			computeMarkers();
			computeProgress();
		}, 500);

		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onResize);

		// Track active chapter via IntersectionObserver.
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
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onResize);
			window.clearTimeout(settleTimer);
			observer.disconnect();
			if (rafId) cancelAnimationFrame(rafId);
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
				class="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-red via-brand-amber to-brand-pink transition-[width] duration-150 ease-out"
				style:width="{(progress * 100).toFixed(2)}%"
			></div>

			<!-- Markers — nav is absolute/inset-0 so % left = % of bar width -->
			<nav aria-label="Chapter progress" class="pointer-events-auto absolute inset-0">
				{#each markers as marker (marker.id)}
					{@const reached = progress >= marker.position - 0.005}
					{@const isActive = activeId === marker.id}
					{@const isHovered = hoveredId === marker.id}

					<!-- Dot anchor — left is a % of the nav (which = bar width) -->
					<a
						href={`#${marker.id}`}
						class="group absolute top-1/2 -translate-y-1/2 -translate-x-1/2 outline-none"
						style:left="{(marker.position * 100).toFixed(2)}%"
						aria-current={isActive ? 'location' : undefined}
						aria-label={`${marker.eyebrow}: ${marker.title}`}
						onclick={() => posthog.capture('progress_bar_chapter_clicked', { chapter_id: marker.id, chapter_number: marker.number, chapter_title: marker.title })}
						onmouseenter={() => (hoveredId = marker.id)}
						onmouseleave={() => (hoveredId = null)}
						onfocus={() => (hoveredId = marker.id)}
						onblur={() => (hoveredId = null)}
					>
						<span
							class={cn(
								'block rounded-full border-2 transition-all duration-200',
								isActive
									? 'size-4 border-brand-red bg-brand-red shadow-[0_0_0_4px_rgb(254_249_239)]'
									: reached
										? 'size-2.5 border-ink bg-ink'
										: 'size-2.5 border-ink/40 bg-cream',
								'group-hover:scale-125 group-focus-visible:scale-125 group-focus-visible:ring-2 group-focus-visible:ring-brand-red group-focus-visible:ring-offset-2'
							)}
							aria-hidden="true"
						></span>
					</a>

					<!-- Tooltip — shown only on hover/focus, perfectly centered under the dot -->
					{#if isHovered}
						<span
							class="pointer-events-none fixed z-50 -translate-x-1/2 rounded-md bg-ink px-2.5 py-1 text-[11px] font-semibold tracking-wide whitespace-nowrap text-cream shadow-lg"
							style:left="{dotCenterPx(marker)}px"
							style:top="80px"
							aria-hidden="true"
						>
							<span class="text-brand-amber">{marker.number.toString().padStart(2, '0')}</span>
							<span class="ml-1">{marker.title}</span>
						</span>
					{/if}
				{/each}
			</nav>
		</div>
	</div>
</div>
{/if}