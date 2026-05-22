<script lang="ts">
	import { onMount } from 'svelte';
	import BookmarkCheck from 'lucide-svelte/icons/bookmark-check';
	import Eraser from 'lucide-svelte/icons/eraser';
	import { getExplainerHolder } from '$lib/context/explainer.svelte';
	import {
		READER_RESUME_NAV_FLAG,
		posthog,
		readFeatureFlag,
		subscribeFeatureFlags
	} from '$lib/analytics/posthog';
	import {
		clearReaderPosition,
		hasMeaningfulReaderPosition,
		jumpToReaderPosition,
		loadReaderPosition,
		readerPositions
	} from '$lib/reader-position.svelte';
	import { cn } from '$lib/utils/cn';

	interface Props {
		variant?: 'desktop' | 'mobile';
	}

	let { variant = 'desktop' }: Props = $props();

	const explainerHolder = getExplainerHolder();
	const explainer = $derived(explainerHolder?.current ?? null);
	let navEnabled = $state(false);
	let loadedSlug = '';

	const position = $derived(explainer ? (readerPositions[explainer.meta.slug] ?? null) : null);
	const visible = $derived(navEnabled && hasMeaningfulReaderPosition(position, explainer));

	function refreshFlag() {
		navEnabled = readFeatureFlag(READER_RESUME_NAV_FLAG);
	}

	onMount(() => {
		refreshFlag();
		return subscribeFeatureFlags(refreshFlag);
	});

	$effect(() => {
		const slug = explainer?.meta.slug;
		if (!slug || slug === loadedSlug) return;
		loadedSlug = slug;
		loadReaderPosition(slug);
	});

	function jump() {
		if (!position) return;
		jumpToReaderPosition(position, 'nav');
	}

	function clear() {
		if (!explainer) return;
		clearReaderPosition(explainer.meta.slug);
		posthog.capture('reader_resume_cleared', {
			surface: 'nav',
			explainer_slug: explainer.meta.slug
		});
	}
</script>

{#if visible && position}
	<div
		class={cn(
			'pointer-events-auto flex items-center overflow-hidden rounded-full border border-ink/10 bg-cream/95 shadow-lg shadow-ink/8 backdrop-blur',
			variant === 'desktop' ? 'hidden sm:flex' : 'sm:hidden'
		)}
	>
		<button
			type="button"
			onclick={jump}
			class="group flex min-h-9 cursor-pointer items-center gap-1.5 px-3 text-xs font-bold text-ink/70 transition-colors hover:bg-ink/6 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
			aria-label={`Jump to last read position: Chapter ${position.chapterNumber}, ${position.chapterTitle}`}
			title={`Jump to Chapter ${position.chapterNumber}: ${position.chapterTitle}`}
		>
			<BookmarkCheck size={16} aria-hidden="true" />
			<span class={variant === 'desktop' ? 'hidden lg:inline' : ''}>Jump back</span>
		</button>
		<span class="h-5 w-px bg-ink/10" aria-hidden="true"></span>
		<button
			type="button"
			onclick={clear}
			class="flex min-h-9 min-w-9 cursor-pointer items-center justify-center text-ink/45 transition-colors hover:bg-ink/6 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
			aria-label="Clear saved reading position"
			title="Clear saved reading position"
		>
			<Eraser size={15} aria-hidden="true" />
		</button>
	</div>
{/if}
