<script lang="ts">
	import { onMount } from 'svelte';
	import BookmarkCheck from 'lucide-svelte/icons/bookmark-check';
	import { getExplainerHolder } from '$lib/context/explainer.svelte';
	import {
		READER_RESUME_TOAST_FLAG,
		posthog,
		readFeatureFlag,
		subscribeFeatureFlags
	} from '$lib/analytics/posthog';
	import {
		loadReaderResumeMode,
		loadReaderPosition,
		loadReaderResumeNudgesDisabled,
		observedReaderPositions,
		readerPositions,
		readerResumePreference,
		saveObservedReaderPosition,
		setReaderResumeMode
	} from '$lib/reader-position.svelte';
	import { notifyReaderResumePreference } from '$lib/components/nav/reader-resume-notify';

	const explainerHolder = getExplainerHolder();
	const explainer = $derived(explainerHolder?.current ?? null);
	let toastFeatureEnabled = $state(false);
	let loadedSlug = '';
	let savedPulse = $state(false);
	let pulseTimer: ReturnType<typeof setTimeout> | undefined;

	const position = $derived(explainer ? (readerPositions[explainer.meta.slug] ?? null) : null);
	const observedPosition = $derived(
		explainer ? (observedReaderPositions[explainer.meta.slug] ?? null) : null
	);
	const visible = $derived(toastFeatureEnabled && Boolean(explainer));
	const mode = $derived(readerResumePreference.mode);
	const isAuto = $derived(mode === 'auto');
	const isManual = $derived(mode === 'manual');
	const isOff = $derived(mode === 'off');
	const label = $derived(isAuto ? 'Auto' : isManual ? 'Manual' : 'Off');
	const canSaveManually = $derived(Boolean(observedPosition || position));
	const manualMatchesSavedPosition = $derived(
		Boolean(
			position &&
			(!observedPosition ||
				(position.elementId === observedPosition.elementId &&
					position.stepId === observedPosition.stepId &&
					position.chapterId === observedPosition.chapterId))
		)
	);

	function refreshFlag() {
		toastFeatureEnabled = readFeatureFlag(READER_RESUME_TOAST_FLAG);
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
		loadReaderResumeNudgesDisabled();
		loadReaderResumeMode();
	});

	$effect(() => {
		if (!explainer) return;
		if (readerResumePreference.lastSavedSlug !== explainer.meta.slug) return;
		if (readerResumePreference.lastSavedAt <= 0) return;

		savedPulse = true;
		if (pulseTimer) clearTimeout(pulseTimer);
		pulseTimer = setTimeout(() => {
			savedPulse = false;
		}, 1400);

		return () => {
			if (pulseTimer) clearTimeout(pulseTimer);
		};
	});

	function toggleMode() {
		if (!explainer) return;
		const nextMode = isAuto ? 'manual' : isManual ? 'off' : 'auto';
		setReaderResumeMode(nextMode);
		if (nextMode === 'auto') {
			saveObservedReaderPosition(explainer.meta.slug);
		}
		posthog.capture('reader_bookmarking_mode_changed', {
			explainer_slug: explainer.meta.slug,
			mode: nextMode
		});
		notifyReaderResumePreference(
			nextMode === 'auto'
				? 'Bookmarking set to auto'
				: nextMode === 'manual'
					? 'Bookmarking set to manual'
					: 'Bookmarking turned off'
		);
	}

	function saveManualPosition() {
		if (!explainer || !isManual) return;

		const saved = saveObservedReaderPosition(explainer.meta.slug);
		if (saved) {
			posthog.capture('reader_manual_bookmark_saved', {
				explainer_slug: explainer.meta.slug,
				chapter_id: saved.chapterId,
				step_id: saved.stepId
			});
			notifyReaderResumePreference('Location saved for next time');
			return;
		}

		notifyReaderResumePreference('Start reading to choose a location');
	}
</script>

{#if visible}
	<div
		class={[
			'group relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border text-xs font-semibold transition-colors sm:text-sm',
			isAuto
				? 'border-brand-forest/20 bg-brand-forest/8 text-brand-forest hover:border-brand-forest/35 hover:bg-brand-forest/12 hover:text-brand-forest-deep'
				: isOff
					? 'border-ink/10 bg-ink/[0.035] text-ink/35 opacity-80 hover:border-ink/16 hover:bg-ink/[0.055] hover:text-ink/55 hover:opacity-100'
					: manualMatchesSavedPosition
						? 'border-brand-forest/20 bg-brand-forest/8 text-brand-forest hover:border-brand-forest/35 hover:bg-brand-forest/12 hover:text-brand-forest-deep'
						: 'border-brand-amber/35 bg-brand-amber/10 text-brand-amber hover:border-brand-amber/50 hover:bg-brand-amber/14 hover:text-ink'
		]}
	>
		<button
			type="button"
			onclick={saveManualPosition}
			disabled={!isManual || !canSaveManually}
			class={[
				'inline-flex size-8 items-center justify-center transition-colors duration-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-forest sm:size-9',
				isAuto
					? savedPulse
						? 'cursor-default text-brand-forest-deep'
						: 'cursor-default text-brand-forest'
					: isOff
						? 'cursor-default text-ink/30'
						: canSaveManually
							? [
									'cursor-pointer hover:bg-brand-amber/16',
									manualMatchesSavedPosition ? 'text-brand-forest' : 'text-brand-amber'
								]
							: 'cursor-not-allowed opacity-45'
			]}
			aria-label={isAuto
				? 'Bookmarking is set to auto'
				: isOff
					? 'Bookmarking is off'
				: 'Save this reading location for next time'}
			title={isAuto
				? 'Bookmarking is set to auto'
				: isOff
					? 'Bookmarking is off'
					: 'Save this location for next time'}
		>
			<BookmarkCheck class="size-4 sm:size-[18px]" strokeWidth={2.35} aria-hidden="true" />
		</button>

		<button
			type="button"
			onclick={toggleMode}
			class={[
				'inline-flex h-8 cursor-pointer items-center justify-center pr-3 pl-0.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-forest sm:h-9 sm:pr-4 sm:pl-1 sm:text-sm',
				isAuto
					? 'text-brand-forest'
					: isOff
						? 'text-ink/45'
						: manualMatchesSavedPosition
							? 'text-brand-forest'
							: 'text-brand-amber'
			]}
			aria-label={isAuto
				? 'Switch to manual bookmarking'
				: isManual
					? 'Turn bookmarking off'
					: 'Switch to auto mode'}
			title={isAuto
				? 'Switch to manual bookmarking'
				: isManual
					? 'Turn bookmarking off'
					: 'Switch to auto mode'}
		>
			<span>{label}</span>
		</button>
	</div>
{/if}
