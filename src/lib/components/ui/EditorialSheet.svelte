<script lang="ts">
	/**
	 * <EditorialSheet> — "Why I made this" trigger + bottom sheet.
	 *
	 * The trigger is a small text link that sits inline with metadata like
	 * "10 chapters · ~14 min read". When clicked it opens a Sheet rendered
	 * with rich editorial prose: paragraphs, blockquotes, images, links.
	 *
	 * Content is passed as an `editorial` object with:
	 *   title  — sheet heading (defaults to "Why I made this")
	 *   body   — HTML string; supports <p>, <h2-h4>, <blockquote>, <img>,
	 *             <ul>/<ol>, <a>, <strong>, <em>. Images are rendered full-
	 *             width with rounded corners; blockquotes get a left border.
	 *
	 * Usage:
	 *   <EditorialSheet editorial={meta.editorial} />
	 */
	import Sheet from '$lib/components/ui/Sheet.svelte';
	import PenLine from 'lucide-svelte/icons/pen-line';
	import { posthog } from '$lib/analytics/posthog';

	interface EditorialContent {
		/** Sheet heading. Defaults to "Why I made this". */
		title?: string;
		/** HTML body — paragraphs, headings, blockquotes, images, links. */
		body: string;
	}

	interface Props {
		editorial: EditorialContent;
		/** Explainer slug for analytics. */
		slug?: string;
		class?: string;
	}

	let { editorial, slug = 'unknown', class: className = '' }: Props = $props();

	let open = $state(false);

	function handleOpen() {
		open = true;
		posthog.capture('editorial_sheet_opened', { explainer: slug });
	}
</script>

<!-- Inline trigger — same size / colour family as "10 chapters · ~14 min read" -->
<button
	type="button"
	onclick={handleOpen}
	class="group inline-flex cursor-pointer items-center gap-1.5 text-sm text-ink/60 transition-colors hover:text-ink {className}"
>
	<PenLine size={13} aria-hidden="true" class="shrink-0 transition-transform group-hover:-rotate-6" />
	<span>{editorial.title ?? 'Why I made this'}</span>
</button>

<Sheet bind:open title={editorial.title ?? 'Why I made this'}>
	<!--
		.editorial-body applies consistent editorial prose styling.
		All rules are scoped to this element via the <style> block below
		so they don't leak into the rest of the sheet.
	-->
	<article class="editorial-body mx-auto max-w-2xl pb-8">
		{@html editorial.body}
	</article>
</Sheet>

<style>
	/* ── Editorial prose styles ─────────────────────────────────────────────── */

	:global(.editorial-body) {
		font-size: 1.0625rem;
		line-height: 1.75;
		color: var(--color-ink);
	}

	:global(.editorial-body > * + *) {
		margin-top: 1.25em;
	}

	:global(.editorial-body p) {
		text-wrap: pretty;
	}

	:global(.editorial-body h2) {
		margin-top: 2em;
		margin-bottom: 0.5em;
		font-family: var(--font-display);
		font-size: 1.375rem;
		font-weight: 700;
		line-height: 1.25;
		color: var(--color-ink);
	}

	:global(.editorial-body h3) {
		margin-top: 1.75em;
		margin-bottom: 0.4em;
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--color-ink);
	}

	:global(.editorial-body blockquote) {
		margin: 1.75em 0;
		padding: 0.1em 1.25em;
		border-left: 3px solid color-mix(in oklab, var(--color-ink) 18%, transparent);
		color: color-mix(in oklab, var(--color-ink) 70%, transparent);
		font-style: italic;
	}

	:global(.editorial-body blockquote p) {
		margin: 0;
	}

	:global(.editorial-body ul),
	:global(.editorial-body ol) {
		padding-left: 1.5em;
	}

	:global(.editorial-body ul) {
		list-style-type: disc;
	}

	:global(.editorial-body ol) {
		list-style-type: decimal;
	}

	:global(.editorial-body li + li) {
		margin-top: 0.4em;
	}

	:global(.editorial-body a) {
		font-weight: 500;
		text-decoration: underline;
		text-underline-offset: 3px;
		text-decoration-thickness: 1px;
		transition: opacity 150ms;
	}

	:global(.editorial-body a:hover) {
		opacity: 0.65;
	}

	:global(.editorial-body strong) {
		font-weight: 600;
	}

	:global(.editorial-body img) {
		width: 100%;
		border-radius: 0.75rem;
		margin: 2em 0;
	}

	:global(.editorial-body figcaption),
	:global(.editorial-body .caption) {
		margin-top: -1.25em;
		margin-bottom: 2em;
		font-size: 0.8125rem;
		color: color-mix(in oklab, var(--color-ink) 50%, transparent);
		text-align: center;
	}

	:global(.editorial-body hr) {
		border: none;
		border-top: 1px solid color-mix(in oklab, var(--color-ink) 12%, transparent);
		margin: 2.5em 0;
	}

	:global(.editorial-body .sources-list) {
		padding-left: 0;
		list-style: none;
		font-size: 0.875rem;
		color: color-mix(in oklab, var(--color-ink) 65%, transparent);
	}

	:global(.editorial-body .sources-list li) {
		padding: 0.4em 0;
		border-bottom: 1px solid color-mix(in oklab, var(--color-ink) 8%, transparent);
	}

	:global(.editorial-body .sources-list a) {
		color: inherit;
	}
</style>
