<script lang="ts">
	/**
	 * <Sheet> — a native <dialog>-based bottom sheet with a draggable handle.
	 *
	 * UX:
	 *   - Slides up from the bottom on open; slides back down on close
	 *   - User can drag the handle to resize between min/max height
	 *   - Dragging below `closeThreshold` dismisses
	 *   - Escape, backdrop click, or close button also dismiss
	 *
	 * a11y:
	 *   - Uses <dialog> with showModal() → top-layer rendering, focus trap,
	 *     ARIA role=dialog, inertness behind, native Escape support.
	 */
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils/cn';
	import X from 'lucide-svelte/icons/x';

	interface Props {
		open?: boolean;
		title?: string;
		children: Snippet;
		class?: string;
	}

	let { open = $bindable(false), title, children, class: className }: Props = $props();

	let dialogEl = $state<HTMLDialogElement | undefined>(undefined);
	let panelEl = $state<HTMLDivElement | undefined>(undefined);

	// isVisible controls the CSS animation — kept separate from dialog.open
	// so close() isn't called until after the slide-out animation finishes.
	let isVisible = $state(false);

	const defaultHeight = 60; // initial height (vh)
	const minHeight = 25;
	const maxHeight = 92;
	const closeThreshold = 18; // drag below this to dismiss

	let panelHeight = $state(defaultHeight);
	let isDragging = $state(false);
	let dragStartY = 0;
	let dragStartHeight = 0;

	let prefersReducedMotion = $derived(
		typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
	);

	// Sync `open` prop → dialog + animation state.
	$effect(() => {
		if (!dialogEl) return;

		if (open) {
			// Open: show dialog then trigger slide-in animation.
			// Focus the panel div (tabindex=-1) instead of the first interactive
			// child so the drag handle doesn't receive a visible focus ring on open.
			if (!dialogEl.open) dialogEl.showModal();
			isVisible = true;
			panelHeight = defaultHeight;
			document.body.style.overflow = 'hidden';
			// Defer so the dialog is fully painted before we steal focus.
			requestAnimationFrame(() => panelEl?.focus());
		} else if (isVisible) {
			// Close: play slide-out animation, then close dialog after transition.
			isVisible = false;
			const duration = prefersReducedMotion ? 0 : 300;
			setTimeout(() => {
				if (dialogEl?.open) dialogEl.close();
				document.body.style.overflow = '';
			}, duration);
		}
	});

	function handleClose() {
		open = false;
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			handleClose();
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === dialogEl) handleClose();
	}

	function startDrag(e: PointerEvent) {
		if (e.pointerType === 'mouse' && e.button !== 0) return;
		isDragging = true;
		dragStartY = e.clientY;
		dragStartHeight = panelHeight;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		e.preventDefault();
	}

	function onDrag(e: PointerEvent) {
		if (!isDragging) return;
		const dy = e.clientY - dragStartY;
		const dh = (dy / window.innerHeight) * 100;
		// Dragging down (positive dy) shrinks the panel.
		panelHeight = Math.max(0, Math.min(maxHeight, dragStartHeight - dh));
	}

	function endDrag(e: PointerEvent) {
		if (!isDragging) return;
		isDragging = false;
		try {
			(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
		} catch {
			// pointer may have already been released
		}
		if (panelHeight < closeThreshold) {
			handleClose();
		} else if (panelHeight < minHeight) {
			panelHeight = minHeight;
		}
	}
</script>

<!--
	The <dialog> is a transparent full-viewport overlay. All visual styling
	lives on the inner .panel so we can fully control layout (the native UA
	stylesheet centres <dialog> elements by default, which fights a bottom
	sheet design).
-->
<dialog
	bind:this={dialogEl}
	onkeydown={handleKeyDown}
	onclick={handleBackdropClick}
	onclose={() => {
		// Only fired when dialog.close() is called directly (Escape key).
		open = false;
	}}
	class={cn(
		'sheet-dialog backdrop:bg-ink/40 backdrop:backdrop-blur-sm',
		className
	)}
	aria-label={title}
>
	<!--
		Bottom-anchored, height-resizable panel.
		Slide in from below: translateY(100%) → translateY(0) on open.
		Slide out to below: translateY(0) → translateY(100%) on close.
	-->
	<div
		bind:this={panelEl}
		tabindex="-1"
		class={cn(
			'absolute inset-x-0 bottom-0 mx-auto flex flex-col',
			'w-full max-w-(--container-wide)',
			'rounded-t-2xl bg-cream shadow-2xl outline-none',
			isDragging || prefersReducedMotion
				? 'transition-none'
				: 'transition-[transform,height] duration-300 ease-out'
		)}
		style:height="{isVisible ? panelHeight : 0}vh"
		style:transform={isVisible ? 'translateY(0)' : 'translateY(100%)'}
	>
		<!-- Drag handle — touch-friendly hit area, native pointer gestures -->
		<button
			type="button"
			onpointerdown={startDrag}
			onpointermove={onDrag}
			onpointerup={endDrag}
			onpointercancel={endDrag}
			aria-label="Drag to resize. Drag down to close."
			class={cn(
				'flex w-full shrink-0 cursor-grab items-center justify-center py-3',
				'touch-none select-none active:cursor-grabbing'
			)}
		>
			<span aria-hidden="true" class="block h-1.5 w-12 rounded-full bg-ink/25"></span>
		</button>

		<!-- Header -->
		<div
			class="flex shrink-0 items-center justify-between gap-4 border-b border-ink/10 px-6 pb-3 lg:px-8"
		>
			{#if title}
				<h2 class="font-display text-xl font-bold text-ink">{title}</h2>
			{:else}
				<div></div>
			{/if}
		<button
			type="button"
			onclick={handleClose}
			aria-label="Close panel"
			class="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full p-2.5 text-ink/60 transition-colors hover:bg-ink/8 hover:text-ink"
		>
			<X size={22} aria-hidden="true" />
		</button>
		</div>

		<!-- Scrollable content -->
		<div class="safe-area-pb flex-1 overflow-y-auto px-6 py-6 pb-8 lg:px-8">
			{@render children()}
		</div>
	</div>
</dialog>

<style>
	/*
	 * Reset the user-agent <dialog> styles so the element is a transparent
	 * full-viewport overlay. We anchor the visible panel ourselves.
	 */
	.sheet-dialog {
		position: fixed;
		inset: 0;
		width: 100%;
		height: 100%;
		max-width: none;
		max-height: none;
		margin: 0;
		padding: 0;
		background: transparent;
		border: none;
		overflow: hidden;
	}

	.sheet-dialog:not([open]) {
		display: none;
	}

	.sheet-dialog[open] {
		display: block;
	}
</style>
