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
		contentKind?: 'text' | 'image' | 'chart' | 'stat' | 'quote' | 'source' | 'dataset';
		contentJson?: Record<string, unknown> | null;
	}

	const user = $derived(page.data.user as UserSummary | null | undefined);

	let payload = $state<SelectionPayload | null>(null);
	let takeawayAnchor = $state<{ x: number; y: number } | null>(null);
	let saving = $state(false);
	let saved = $state(false);
	let selectionTimer: number | undefined;
	let lastSelectionKey = '';
	const timedToastOptions = {
		duration: 5200,
		closeButton: true,
		class: 'timed-toast'
	};

	onDestroy(() => {
		if (browser) window.clearTimeout(selectionTimer);
	});

	function selectionAnchorRect(range: Range): DOMRect {
		const visibleRects = Array.from(range.getClientRects()).filter(
			(rect) => rect.width > 0 && rect.height > 0
		);
		return visibleRects.at(-1) ?? range.getBoundingClientRect();
	}

	function parseContentJson(source: HTMLElement): Record<string, unknown> | null {
		const raw = source.dataset.insightContentJson;
		if (!raw) return null;
		try {
			const parsed = JSON.parse(raw);
			return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
				? (parsed as Record<string, unknown>)
				: null;
		} catch {
			return null;
		}
	}

	function sourcePayload(source: HTMLElement, selectedText: string): SelectionPayload | null {
		if (
			!source.dataset.insightExplainer ||
			!source.dataset.insightChapter ||
			!source.dataset.insightStep
		) {
			return null;
		}

		const surroundingText =
			source.dataset.insightSurroundingText ||
			source.textContent?.replace(/\s+/g, ' ').trim() ||
			selectedText;

		return {
			explainerSlug: source.dataset.insightExplainer,
			chapterId: source.dataset.insightChapter,
			stepId: source.dataset.insightStep,
			selectedText,
			surroundingText,
			contentKind: (source.dataset.insightContentKind as SelectionPayload['contentKind']) ?? 'text',
			contentJson: parseContentJson(source)
		};
	}

	function visualTextFromRange(range: Range): string[] {
		return Array.from(document.querySelectorAll<HTMLElement>('[data-insight-visual-text]'))
			.filter((element) => {
				try {
					return range.intersectsNode(element);
				} catch {
					return false;
				}
			})
			.map((element) => element.dataset.insightVisualText?.trim() ?? '')
			.filter(Boolean);
	}

	function sourceFromNode(node: Node | null): HTMLElement | null {
		const element =
			node?.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node?.parentElement;
		const source = element?.closest('[data-insight-source="true"]') as HTMLElement | null;
		return source?.dataset.insightExplainer &&
			source.dataset.insightChapter &&
			source.dataset.insightStep
			? source
			: null;
	}

	function sourcesFromRange(range: Range): HTMLElement[] {
		const sources = new Set<HTMLElement>();
		const startSource = sourceFromNode(range.startContainer);
		const endSource = sourceFromNode(range.endContainer);
		if (startSource) sources.add(startSource);
		if (endSource) sources.add(endSource);

		for (const element of document.querySelectorAll<HTMLElement>('[data-insight-source="true"]')) {
			try {
				if (range.intersectsNode(element)) sources.add(element);
			} catch {
				// Detached or browser-internal nodes can throw here; ignore them.
			}
		}

		return Array.from(sources);
	}

	function setPayload(next: SelectionPayload, anchor: { x: number; y: number } | null = null) {
		const selectionKey = [next.explainerSlug, next.chapterId, next.stepId, next.selectedText].join(
			'\n'
		);
		if (selectionKey === lastSelectionKey && anchor === takeawayAnchor) return;
		lastSelectionKey = selectionKey;
		takeawayAnchor = anchor;
		payload = next;
		saved = false;
		posthog.capture('insight_selection_started', {
			explainer_slug: next.explainerSlug,
			chapter_id: next.chapterId,
			step_id: next.stepId,
			selection_length: next.selectedText.length
		});
	}

	function readSelection(): SelectionPayload | null {
		if (!browser) return null;

		const selection = document.getSelection();
		const selectedText = selection?.toString().trim() ?? '';
		if (!selection || selectedText.length < 3 || selection.rangeCount === 0) return null;

		const range = selection.getRangeAt(0);
		const sources = sourcesFromRange(range);
		const source = sources[0];
		if (!source) return null;

		const rect = selectionAnchorRect(range);
		if (rect.width === 0 && rect.height === 0) return null;

		const visualTexts = visualTextFromRange(range);
		const combinedText = Array.from(new Set([selectedText, ...visualTexts]))
			.filter(Boolean)
			.join('\n\n');
		const next = sourcePayload(source, combinedText);
		if (!next) return null;

		const sourceContext = sources
			.map(
				(item) =>
					item.dataset.insightSurroundingText ||
					item.textContent?.replace(/\s+/g, ' ').trim() ||
					''
			)
			.filter(Boolean)
			.join('\n\n');

		return {
			...next,
			surroundingText: Array.from(new Set([sourceContext, next.surroundingText]))
				.filter(Boolean)
				.join('\n\n')
		};
	}

	function updateSelection() {
		if (!browser) return;

		const next = readSelection();
		if (!next) return;
		if (saving) return;
		setPayload(next);
	}

	function handleContextMenu(event: MouseEvent) {
		if (!browser) return;
		const target = event.target as HTMLElement | null;
		if (target?.closest('a, button, input, textarea, select, [data-takeaway-action="true"]')) return;

		const visual = target?.closest('[data-insight-visual-text]') as HTMLElement | null;
		const visualText = visual?.dataset.insightVisualText?.trim();
		if (!visual || !visualText) return;

		const next = sourcePayload(visual, visualText);
		if (!next) return;

		event.preventDefault();
		document.getSelection()?.removeAllRanges();
		if (saving) return;
		const x = Math.min(Math.max(event.clientX, 12), window.innerWidth - 220);
		const y = Math.min(Math.max(event.clientY, 12), window.innerHeight - 84);
		setPayload(next, { x, y });
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
			takeawayAnchor = null;
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
		if (browser && document.getSelection()?.toString().trim()) {
			scheduleSelectionUpdate();
			return;
		}
		payload = null;
		takeawayAnchor = null;
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
					contentKind: payload.contentKind ?? 'text',
					contentJson: payload.contentJson ?? null,
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
			toast.success('Packed into your takeaways', timedToastOptions);
			saved = true;
			window.setTimeout(() => {
				payload = null;
				takeawayAnchor = null;
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
					: 'Could not pack that takeaway',
				timedToastOptions
			);
			if (reason === 'migration_pending') {
				payload = null;
				takeawayAnchor = null;
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
	oncontextmenu={handleContextMenu}
	onpointerdown={hideFloatingTakeawayOnOutsidePointer}
	onscroll={hideFloatingTakeaway}
	onwheel={hideFloatingTakeaway}
	ontouchmove={hideFloatingTakeaway}
/>

<svelte:window onresize={hideFloatingTakeaway} onkeydown={handleKeydown} />

{#if payload}
	<div
		data-takeaway-action="true"
		class="takeaway-bar fixed z-[100] w-full {takeawayAnchor
			? 'takeaway-context max-w-max'
			: 'inset-x-0 bottom-0 mx-auto sm:inset-x-4 sm:bottom-4 sm:max-w-max'}"
		class:takeaway-saving={saving}
		class:takeaway-saved={saved}
		style:left={takeawayAnchor ? `${takeawayAnchor.x}px` : undefined}
		style:top={takeawayAnchor ? `${takeawayAnchor.y}px` : undefined}
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
		--takeaway-transform: translateY(0);
		padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
		transform: var(--takeaway-transform);
		animation: takeaway-pop 180ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.takeaway-context {
		--takeaway-transform: translate(0.5rem, -50%);
		padding-bottom: 0;
	}

	.takeaway-context .takeaway-panel {
		border-radius: 9999px;
		padding: 0;
	}

	.takeaway-context .takeaway-panel > div:first-child {
		display: none;
	}

	.takeaway-context .takeaway-panel > div:last-child {
		padding-top: 0;
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
			transform: var(--takeaway-transform) translateY(0.25rem) scale(0.98);
		}
		to {
			opacity: 1;
			transform: var(--takeaway-transform) translateY(0) scale(1);
		}
	}

	@keyframes takeaway-packed {
		0% {
			transform: var(--takeaway-transform) scale(1);
		}
		45% {
			transform: var(--takeaway-transform) scale(1.02);
		}
		100% {
			transform: var(--takeaway-transform) scale(1);
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
