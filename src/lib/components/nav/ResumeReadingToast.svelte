<script lang="ts" module>
	import { SvelteSet } from 'svelte/reactivity';

	const shownToastKeys = new SvelteSet<string>();
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { getExplainerHolder } from '$lib/context/explainer.svelte';
	import ResumeReadingPrompt from '$lib/components/nav/ResumeReadingPrompt.svelte';
	import {
		READER_RESUME_TOAST_FLAG,
		posthog,
		readFeatureFlag,
		subscribeFeatureFlags
	} from '$lib/analytics/posthog';
	import {
		hasMeaningfulReaderPosition,
		loadReaderResumeMode,
		loadReaderPosition,
		readerResumePreference,
		type ReaderPosition
	} from '$lib/reader-position.svelte';

	const explainerHolder = getExplainerHolder();
	const explainer = $derived(explainerHolder?.current ?? null);

	let toastEnabled = $state(false);
	let loadedSlug = '';
	let initialPosition = $state<ReaderPosition | null>(null);
	let modeLoaded = $state(false);
	let activeToastId: string | number | undefined;
	const bookmarkingOff = $derived(readerResumePreference.mode === 'off');

	function refreshFlag() {
		toastEnabled = readFeatureFlag(READER_RESUME_TOAST_FLAG);
	}

	onMount(() => {
		refreshFlag();
		return subscribeFeatureFlags(refreshFlag);
	});

	$effect(() => {
		const slug = explainer?.meta.slug;
		if (!slug || slug === loadedSlug) return;
		loadedSlug = slug;
		modeLoaded = false;
		initialPosition = loadReaderPosition(slug);
		loadReaderResumeMode();
		modeLoaded = true;
	});

	$effect(() => {
		if (!bookmarkingOff || activeToastId === undefined) return;
		toast.dismiss(activeToastId);
		activeToastId = undefined;
	});

	$effect(() => {
		if (!toastEnabled || !explainer) return;
		if (!modeLoaded) return;
		if (bookmarkingOff) return;
		if (!hasMeaningfulReaderPosition(initialPosition, explainer)) return;
		if (typeof window !== 'undefined' && window.location.hash) return;

		const toastKey = `${initialPosition.explainerSlug}:${initialPosition.updatedAt}`;
		if (shownToastKeys.has(toastKey)) return;
		shownToastKeys.add(toastKey);

		activeToastId = toast.custom(ResumeReadingPrompt, {
			componentProps: {
				position: initialPosition,
				explainer
			},
			class: 'w-fit max-w-[calc(100vw-2rem)]',
			duration: Number.POSITIVE_INFINITY,
			unstyled: true,
			onDismiss: () => {
				activeToastId = undefined;
			},
			onAutoClose: () => {
				activeToastId = undefined;
			}
		});

		posthog.capture('reader_resume_toast_shown', {
			explainer_slug: initialPosition.explainerSlug,
			chapter_id: initialPosition.chapterId,
			step_id: initialPosition.stepId
		});
	});
</script>
