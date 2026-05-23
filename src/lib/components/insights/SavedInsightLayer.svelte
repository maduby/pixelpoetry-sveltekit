<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { posthog } from '$lib/analytics/posthog';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import LogIn from 'lucide-svelte/icons/log-in';
	import X from 'lucide-svelte/icons/x';
	import { onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';

	type UserSummary = {
		id: string;
		name: string;
		email: string;
		image?: string | null;
	};

	interface SelectionPayload {
		explainerSlug: string;
		chapterId: string;
		stepId: string;
		selectedText: string;
		surroundingText: string;
	}

	const user = $derived(page.data.user as UserSummary | null | undefined);

	let payload = $state<SelectionPayload | null>(null);
	let saving = $state(false);
	let saved = $state(false);
	let selectionTimer: number | undefined;
	let lastSelectionKey = '';

	onDestroy(() => {
		if (browser) window.clearTimeout(selectionTimer);
	});

	function selectionAnchorRect(range: Range): DOMRect {
		const visibleRects = Array.from(range.getClientRects()).filter(
			(rect) => rect.width > 0 && rect.height > 0
		);
		return visibleRects.at(-1) ?? range.getBoundingClientRect();
	}

	function readSelection(): SelectionPayload | null {
		if (!browser) return null;

		const selection = document.getSelection();
		const selectedText = selection?.toString().trim() ?? '';
		if (!selection || selectedText.length < 3 || selection.rangeCount === 0) return null;

		const range = selection.getRangeAt(0);
		const container =
			range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
				? (range.commonAncestorContainer as HTMLElement)
				: range.commonAncestorContainer.parentElement;
		const source = container?.closest('[data-insight-source="true"]') as HTMLElement | null;
		if (
			!source?.dataset.insightExplainer ||
			!source.dataset.insightChapter ||
			!source.dataset.insightStep
		) {
			return null;
		}

		const rect = selectionAnchorRect(range);
		if (rect.width === 0 && rect.height === 0) return null;

		return {
			explainerSlug: source.dataset.insightExplainer,
			chapterId: source.dataset.insightChapter,
			stepId: source.dataset.insightStep,
			selectedText,
			surroundingText: source.textContent?.replace(/\s+/g, ' ').trim() ?? selectedText
		};
	}

	function updateSelection() {
		if (!browser) return;

		const next = readSelection();
		if (!next) return;
		if (saving) return;
		const selectionKey = [next.explainerSlug, next.chapterId, next.stepId, next.selectedText].join(
			'\n'
		);
		if (selectionKey === lastSelectionKey) return;
		lastSelectionKey = selectionKey;
		payload = next;
		saved = false;
		posthog.capture('insight_selection_started', {
			explainer_slug: next.explainerSlug,
			chapter_id: next.chapterId,
			step_id: next.stepId,
			selection_length: next.selectedText.length
		});
	}

	function scheduleSelectionUpdate() {
		if (!browser) return;
		window.clearTimeout(selectionTimer);
		selectionTimer = window.setTimeout(updateSelection, 40);
	}

	function clearEmptySelection() {
		if (!browser) return;
		if (!document.getSelection()?.toString().trim() && !saving && !saved) {
			payload = null;
			lastSelectionKey = '';
		}
	}

	function scheduleSelectionChange() {
		if (!browser) return;
		window.clearTimeout(selectionTimer);
		selectionTimer = window.setTimeout(() => {
			if (!document.getSelection()?.toString().trim()) {
				clearEmptySelection();
				return;
			}
			updateSelection();
		}, 80);
	}

	function hideFloatingTakeaway() {
		if (saving || saved) return;
		payload = null;
		lastSelectionKey = '';
	}

	function hideFloatingTakeawayOnOutsidePointer(event: PointerEvent) {
		const target = event.target as HTMLElement | null;
		if (target?.closest('[data-takeaway-action="true"]')) return;
		hideFloatingTakeaway();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') hideFloatingTakeaway();
	}

	async function saveTakeaway() {
		if (!payload) return;
		if (!user) {
			const redirectTo = `${page.url.pathname}${page.url.search}`;
			goto(resolve(`/login?redirectTo=${encodeURIComponent(redirectTo)}`));
			return;
		}

		posthog.capture('insight_save_opened', {
			explainer_slug: payload.explainerSlug,
			chapter_id: payload.chapterId,
			step_id: payload.stepId,
			selection_length: payload.selectedText.length
		});
		posthog.capture('insight_takeaway_clicked', {
			explainer_slug: payload.explainerSlug,
			chapter_id: payload.chapterId,
			step_id: payload.stepId,
			selection_length: payload.selectedText.length
		});
		saving = true;
		saved = false;

		try {
			const response = await fetch('/api/ai/insights', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					explainerSlug: payload.explainerSlug,
					chapterId: payload.chapterId,
					stepId: payload.stepId,
					selectedText: payload.selectedText,
					surroundingText: payload.surroundingText,
					note: null
				})
			});

			if (!response.ok) {
				if (response.status === 503) {
					throw new Error('migration_pending');
				}
				throw new Error('request_failed');
			}
			posthog.capture('insight_saved', {
				explainer_slug: payload.explainerSlug,
				chapter_id: payload.chapterId,
				step_id: payload.stepId,
				selection_length: payload.selectedText.length
			});
			toast.success('Packed into your takeaways');
			saved = true;
			window.setTimeout(() => {
				payload = null;
				saved = false;
				lastSelectionKey = '';
				document.getSelection()?.removeAllRanges();
			}, 850);
		} catch (err) {
			const reason = err instanceof Error ? err.message : 'request_failed';
			posthog.capture('insight_save_failed', { reason });
			toast.error(
				reason === 'migration_pending'
					? 'Saved takeaways need the database migration first'
					: 'Could not pack that takeaway'
			);
			if (reason === 'migration_pending') {
				payload = null;
				lastSelectionKey = '';
				document.getSelection()?.removeAllRanges();
			}
		} finally {
			saving = false;
		}
	}
</script>

<svelte:document
	onpointerup={scheduleSelectionUpdate}
	onmouseup={scheduleSelectionUpdate}
	onkeyup={scheduleSelectionUpdate}
	onselectionchange={scheduleSelectionChange}
	onpointerdown={hideFloatingTakeawayOnOutsidePointer}
	onscroll={hideFloatingTakeaway}
	onwheel={hideFloatingTakeaway}
	ontouchmove={hideFloatingTakeaway}
/>

<svelte:window onresize={hideFloatingTakeaway} onkeydown={handleKeydown} />

{#if payload}
	<div
		data-takeaway-action="true"
		class="takeaway-bar fixed inset-x-0 bottom-0 z-[100] mx-auto w-full sm:inset-x-4 sm:bottom-4 sm:max-w-max"
		class:takeaway-saving={saving}
		class:takeaway-saved={saved}
		role="dialog"
		aria-modal="false"
		aria-label="Selected text takeaway action"
	>
		<div
			class="takeaway-panel flex items-center justify-center gap-2 rounded-t-2xl p-3 sm:rounded-lg"
		>
			<div
				class="absolute top-2 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-ink/15 sm:hidden"
				aria-hidden="true"
			></div>
			<div class="flex w-full items-center gap-2 pt-3 sm:w-auto sm:pt-0">
				<button
					type="button"
					onclick={saveTakeaway}
					disabled={saving || saved}
					aria-label={user ? 'Save selected text as a takeaway' : 'Log in to save this takeaway'}
					class="takeaway-button inline-flex min-h-11 flex-1 cursor-pointer items-stretch justify-center overflow-hidden rounded-full text-sm font-black tracking-[0.04em] transition-colors disabled:cursor-default sm:flex-none"
				>
					{#if user}
						{#if saving}
							<span class="takeaway-icon-segment">
								<LoaderCircle class="animate-spin" size={17} aria-hidden="true" />
							</span>
							<span class="takeaway-label-segment">Packing</span>
						{:else if saved}
							<span class="takeaway-icon-segment">
								<span class="takeaway-emoji" aria-hidden="true">🥡</span>
							</span>
							<span class="takeaway-label-segment">Packed</span>
						{:else}
							<span class="takeaway-icon-segment">
								<span class="takeaway-emoji" aria-hidden="true">🥡</span>
							</span>
							<span class="takeaway-label-segment">Take away</span>
						{/if}
					{:else}
						<span class="takeaway-icon-segment">
							<LogIn size={16} aria-hidden="true" />
						</span>
						<span class="takeaway-label-segment">Log in</span>
					{/if}
				</button>
				<button
					type="button"
					onclick={hideFloatingTakeaway}
					class="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-ink text-cream shadow-lg shadow-ink/20 transition-colors hover:bg-ink-soft focus-visible:ring-3 focus-visible:ring-brand-sky focus-visible:outline-none"
					aria-label="Dismiss takeaway action"
				>
					<X size={18} aria-hidden="true" />
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.takeaway-bar {
		--takeaway-bg: var(--color-ink);
		--takeaway-fg: var(--color-cream);
		padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
		animation: takeaway-pop 180ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.takeaway-button {
		background: var(--takeaway-bg);
		color: var(--takeaway-fg);
		box-shadow: 0 0.75rem 1.5rem rgba(10, 10, 10, 0.18);
	}

	.takeaway-button:hover {
		background: color-mix(in oklab, var(--takeaway-bg) 88%, var(--color-paper));
	}

	.takeaway-button:focus-visible {
		outline: 3px solid var(--color-brand-sky);
		outline-offset: 3px;
	}

	.takeaway-icon-segment,
	.takeaway-label-segment {
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.takeaway-icon-segment {
		min-width: 3rem;
		padding-inline: 0.9rem;
		background: color-mix(in oklab, var(--takeaway-fg) 12%, transparent);
	}

	.takeaway-label-segment {
		min-width: max-content;
		padding-inline: 1rem 1.15rem;
		text-transform: uppercase;
	}

	.takeaway-emoji {
		display: inline-block;
		font-size: 1.05rem;
		line-height: 1;
	}

	.takeaway-saving {
		--takeaway-bg: var(--color-ink-soft);
		--takeaway-fg: var(--color-cream);
	}

	.takeaway-saved {
		--takeaway-bg: var(--color-brand-forest-deep);
		--takeaway-fg: var(--color-cream);
		animation: takeaway-packed 520ms cubic-bezier(0.2, 1.4, 0.28, 1);
	}

	.takeaway-saved .takeaway-emoji {
		animation: takeaway-spin 520ms cubic-bezier(0.2, 1.4, 0.28, 1);
	}

	@keyframes takeaway-pop {
		from {
			opacity: 0;
			transform: translateY(0.75rem) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@keyframes takeaway-packed {
		0% {
			transform: scale(1);
		}
		45% {
			transform: scale(1.02);
		}
		100% {
			transform: scale(1);
		}
	}

	@media (max-width: 42rem) {
		.takeaway-panel {
			position: relative;
			padding-top: 1.25rem;
			padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
		}
	}

	@keyframes takeaway-spin {
		0% {
			transform: rotate(0deg) scale(1);
		}
		55% {
			transform: rotate(-10deg) scale(1.3);
		}
		100% {
			transform: rotate(0deg) scale(1);
		}
	}
</style>
