<script lang="ts">
	import BellOff from 'lucide-svelte/icons/bell-off';
	import CirclePlay from 'lucide-svelte/icons/circle-play';
	import XCircle from 'lucide-svelte/icons/circle-x';
	import X from 'lucide-svelte/icons/x';
	import type { ActiveExplainer } from '$lib/context/explainer.svelte';
	import { posthog } from '$lib/analytics/posthog';
	import {
		jumpToReaderPosition,
		setReaderResumeMode,
		type ReaderPosition
	} from '$lib/reader-position.svelte';
	import { notifyReaderResumePreference } from '$lib/components/nav/reader-resume-notify';

	interface Props {
		position: ReaderPosition;
		explainer: ActiveExplainer;
		closeToast?: () => void;
	}

	let { position, explainer, closeToast }: Props = $props();

	function close() {
		closeToast?.();
	}

	function continueReading() {
		jumpToReaderPosition(position, 'toast');
		close();
	}

	function turnOffBookmarking() {
		setReaderResumeMode('off');
		posthog.capture('reader_resume_nudges_disabled', {
			explainer_slug: explainer.meta.slug,
			chapter_id: position.chapterId,
			step_id: position.stepId
		});
		close();
		notifyReaderResumePreference('Bookmarking turned off');
	}
</script>

<div
	class="relative mx-auto flex w-full max-w-[28rem] flex-col items-center gap-4 rounded-2xl border border-ink/10 bg-cream px-5 pt-6 pb-5 text-center text-ink shadow-xl shadow-ink/15 sm:px-6"
>
	<button
		type="button"
		onclick={close}
		class="absolute top-3 right-3 flex size-8 cursor-pointer items-center justify-center rounded-full text-ink/40 transition-colors hover:bg-ink/6 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
		aria-label="Dismiss bookmarking prompt"
	>
		<X size={18} aria-hidden="true" />
	</button>

	<div class="min-w-0">
		<p class="font-display text-2xl leading-tight font-bold text-ink sm:text-3xl">
			Continue reading?
		</p>
		<p class="mx-auto mt-2 max-w-[24rem] text-base leading-snug text-ink/65">
			Pick up at Chapter {position.chapterNumber}: {position.chapterTitle}
		</p>
	</div>

	<div class="flex w-full flex-wrap items-center justify-center gap-2">
		<button
			type="button"
			onclick={close}
			class="inline-flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-ink/6 px-4 py-2.5 text-sm font-bold text-ink/65 transition-colors hover:bg-ink/10 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:flex-none"
		>
			<XCircle size={16} strokeWidth={2.25} aria-hidden="true" />
			<span>Stay here</span>
		</button>
		<button
			type="button"
			onclick={continueReading}
			class="inline-flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-cream transition-colors hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:flex-none"
		>
			<span>Continue</span>
			<CirclePlay size={16} strokeWidth={2.25} aria-hidden="true" />
		</button>
		<button
			type="button"
			onclick={turnOffBookmarking}
			class="inline-flex basis-full cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-brand-red-deep/75 transition-colors hover:bg-brand-red/8 hover:text-brand-red-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red sm:basis-auto"
		>
			<BellOff size={14} strokeWidth={2.25} aria-hidden="true" />
			<span>Turn bookmarking off</span>
		</button>
	</div>
</div>
