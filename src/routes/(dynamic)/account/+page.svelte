<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';
	import { authClient } from '$lib/auth-client';
	import Sheet from '$lib/components/ui/Sheet.svelte';
	import BookOpen from 'lucide-svelte/icons/book-open';
	import Brain from 'lucide-svelte/icons/brain';
	import CheckCircle2 from 'lucide-svelte/icons/check-circle-2';
	import Eye from 'lucide-svelte/icons/eye';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import LogOut from 'lucide-svelte/icons/log-out';
	import Mail from 'lucide-svelte/icons/mail';
	import Pencil from 'lucide-svelte/icons/pencil';
	import Plus from 'lucide-svelte/icons/plus';
	import Save from 'lucide-svelte/icons/save';
	import Search from 'lucide-svelte/icons/search';
	import Sparkles from 'lucide-svelte/icons/sparkles';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import { posthog } from '$lib/analytics/posthog';

	let { data }: PageProps = $props();
	let signingOut = $state(false);
	let generating = $state(false);
	let emailingSummaryId = $state('');
	let deletingInsightId = $state('');
	let deleteConfirmInsightId = $state('');
	let deletingSummaryId = $state('');
	let deleteConfirmSummaryId = $state('');
	let editingSummaryId = $state('');
	let savingSummaryEdit = $state(false);
	let recapSheetOpen = $state(false);
	let activeSummaryId = $state('');
	let editTitle = $state('');
	let editOverview = $state('');
	let editShareableSummary = $state('');
	let actionMessage = $state('');
	let actionError = $state('');
	let takeawayActionError = $state('');
	let takeawaySearch = $state('');
	let selectedInsightIds = $state<string[]>([]);
	let knownInsightIdKey = $state('');

	const latestSummary = $derived(data.summaries[0]);
	const activeSummary = $derived(
		data.summaries.find((summary) => summary.id === activeSummaryId) ?? latestSummary
	);
	const activeSummaryInsights = $derived(
		activeSummary ? (data.summaryInsightsBySummaryId[activeSummary.id] ?? []) : []
	);
	const activeSummaryDeliveries = $derived(
		activeSummary ? data.deliveries.filter((delivery) => delivery.summaryId === activeSummary.id) : []
	);
	const recapsLeft = $derived(Math.max(0, 5 - data.summaries.length));
	const filteredInsights = $derived(
		data.insights.filter((insight) => {
			const query = takeawaySearch.trim().toLowerCase();
			if (!query) return true;
			return [
				insight.explainerSlug,
				insight.chapterId,
				insight.stepId,
				insight.selectedText,
				insight.note ?? ''
			]
				.join(' ')
				.toLowerCase()
				.includes(query);
		})
	);
	const selectedInsightCount = $derived(selectedInsightIds.length);
	const filteredSelectedCount = $derived(
		filteredInsights.filter((insight) => selectedInsightIds.includes(insight.id)).length
	);
	const allFilteredSelected = $derived(
		filteredInsights.length > 0 && filteredSelectedCount === filteredInsights.length
	);
	const pixelPoetryHomeHref = $derived(resolve('/'));
	const activeSummaryExplainerHref = $derived(
		activeSummary ? explainerHref(activeSummary.explainerSlug) : resolve('/explainers')
	);

	$effect(() => {
		const currentIds = data.insights.map((insight) => insight.id);
		const nextKey = currentIds.join('\n');
		if (nextKey === knownInsightIdKey) return;

		const currentIdSet = new Set(currentIds);
		const keptSelection = selectedInsightIds.filter((id) => currentIdSet.has(id));
		selectedInsightIds = knownInsightIdKey ? keptSelection : currentIds;
		knownInsightIdKey = nextKey;
	});

	function selectAllTakeaways() {
		takeawayActionError = '';
		deleteConfirmInsightId = '';
		deleteConfirmSummaryId = '';
		selectedInsightIds = data.insights.map((insight) => insight.id);
	}

	function clearSelectedTakeaways() {
		takeawayActionError = '';
		deleteConfirmInsightId = '';
		deleteConfirmSummaryId = '';
		selectedInsightIds = [];
	}

	function toggleFilteredTakeaways() {
		takeawayActionError = '';
		deleteConfirmInsightId = '';
		deleteConfirmSummaryId = '';
		const filteredIds = filteredInsights.map((insight) => insight.id);
		if (allFilteredSelected) {
			selectedInsightIds = selectedInsightIds.filter((id) => !filteredIds.includes(id));
			return;
		}
		selectedInsightIds = Array.from(new Set([...selectedInsightIds, ...filteredIds]));
	}

	function toggleTakeaway(id: string) {
		takeawayActionError = '';
		deleteConfirmInsightId = '';
		deleteConfirmSummaryId = '';
		selectedInsightIds = selectedInsightIds.includes(id)
			? selectedInsightIds.filter((selectedId) => selectedId !== id)
			: [...selectedInsightIds, id];
	}

	function explainerLabel(slug: string): string {
		return slug
			.split('-')
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(' ');
	}

	function explainerHref(slug: string): string {
		if (slug === 'longevity') return resolve('/longevity/explainer');
		if (slug === 'ultra-processed') return resolve('/ultra-processed/explainer');
		return resolve('/explainers');
	}

	function insightHref(insight: {
		explainerSlug: string;
		chapterId: string;
		stepId: string;
	}): string {
		return `${explainerHref(insight.explainerSlug)}#${insight.chapterId}--${insight.stepId}`;
	}

	function chapterLabel(id: string): string {
		return id
			.split('-')
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(' ');
	}

	function statusLabel(status: string): string {
		if (!status) return '';
		return `${status.charAt(0).toUpperCase()}${status.slice(1)}`;
	}

	function displayDate(date: string): string {
		return new Intl.DateTimeFormat('en-GB', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(new Date(date));
	}

	async function signOut() {
		signingOut = true;
		await authClient.signOut();
		await invalidateAll();
		await goto(resolve('/'));
	}

	async function generateSummary() {
		if (selectedInsightCount === 0) return;
		actionMessage = '';
		actionError = '';
		deleteConfirmInsightId = '';
		deleteConfirmSummaryId = '';
		generating = true;
		posthog.capture('insight_summary_requested', {
			saved_insight_count: data.insights.length,
			selected_insight_count: selectedInsightCount
		});

		try {
			const response = await fetch('/api/ai/insights/summary', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ insightIds: selectedInsightIds })
			});

			if (!response.ok) {
				throw new Error(response.status === 503 ? 'ai_unavailable' : 'request_failed');
			}
			const result = await response.json();
			posthog.capture('insight_summary_completed', {
				provider: result.provider,
				model: result.model,
				prompt_version: result.promptVersion,
				saved_insight_count: data.insights.length,
				selected_insight_count: selectedInsightCount
			});
			actionMessage = 'Your selected-takeaways recap is ready.';
			await invalidateAll();
			activeSummaryId = result.summary.id;
			recapSheetOpen = true;
		} catch (err) {
			const reason = err instanceof Error ? err.message : 'request_failed';
			actionError =
				reason === 'ai_unavailable'
					? 'AI recap generation needs provider credentials before it can run locally.'
					: 'Could not generate your summary just now.';
			posthog.capture('insight_summary_failed', {
				reason,
				saved_insight_count: data.insights.length,
				selected_insight_count: selectedInsightCount
			});
		} finally {
			generating = false;
		}
	}

	function openSummary(summaryId: string) {
		activeSummaryId = summaryId;
		editingSummaryId = '';
		deleteConfirmInsightId = '';
		deleteConfirmSummaryId = '';
		recapSheetOpen = true;
		posthog.capture('insight_summary_opened');
	}

	function startEditingSummary() {
		if (!activeSummary) return;
		deleteConfirmInsightId = '';
		deleteConfirmSummaryId = '';
		editingSummaryId = activeSummary.id;
		editTitle = activeSummary.summaryJson.title;
		editOverview = activeSummary.summaryJson.overview;
		editShareableSummary = activeSummary.summaryJson.shareableSummary;
	}

	function cancelEditingSummary() {
		editingSummaryId = '';
		editTitle = '';
		editOverview = '';
		editShareableSummary = '';
	}

	async function saveSummaryEdit() {
		if (!activeSummary) return;
		actionMessage = '';
		actionError = '';
		deleteConfirmInsightId = '';
		deleteConfirmSummaryId = '';
		savingSummaryEdit = true;

		try {
			const response = await fetch(`/api/ai/insights/summary/${activeSummary.id}`, {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					title: editTitle.trim(),
					overview: editOverview.trim(),
					shareableSummary: editShareableSummary.trim()
				})
			});
			if (!response.ok) throw new Error('request_failed');
			posthog.capture('insight_summary_edited', {
				prompt_version: activeSummary.promptVersion,
				provider: activeSummary.provider,
				model: activeSummary.model
			});
			actionMessage = 'Recap updated.';
			cancelEditingSummary();
			await invalidateAll();
		} catch {
			actionError = 'Could not update that recap just now.';
			posthog.capture('insight_summary_edit_failed', { reason: 'request_failed' });
		} finally {
			savingSummaryEdit = false;
		}
	}

	function requestDeleteInsight(insightId: string) {
		takeawayActionError = '';
		deleteConfirmSummaryId = '';
		if (deleteConfirmInsightId !== insightId) {
			deleteConfirmInsightId = insightId;
			return;
		}
		void deleteInsight(insightId);
	}

	async function deleteInsight(insightId: string) {
		takeawayActionError = '';
		deletingInsightId = insightId;

		try {
			const response = await fetch(`/api/ai/insights/${insightId}`, { method: 'DELETE' });
			if (!response.ok) throw new Error('request_failed');
			deleteConfirmInsightId = '';
			selectedInsightIds = selectedInsightIds.filter((selectedId) => selectedId !== insightId);
			await invalidateAll();
		} catch {
			takeawayActionError = 'Could not delete that takeaway just now.';
		} finally {
			deletingInsightId = '';
		}
	}

	function requestDeleteSummary(summaryId: string) {
		actionError = '';
		deleteConfirmInsightId = '';
		if (deleteConfirmSummaryId !== summaryId) {
			deleteConfirmSummaryId = summaryId;
			return;
		}
		void deleteSummary(summaryId);
	}

	async function deleteSummary(summaryId: string) {
		actionMessage = '';
		actionError = '';
		deleteConfirmInsightId = '';
		deletingSummaryId = summaryId;

		try {
			const response = await fetch(`/api/ai/insights/summary/${summaryId}`, { method: 'DELETE' });
			if (!response.ok) throw new Error('request_failed');
			posthog.capture('insight_summary_deleted');
			deleteConfirmSummaryId = '';
			actionMessage = 'Recap deleted.';
			if (activeSummaryId === summaryId) {
				recapSheetOpen = false;
				activeSummaryId = '';
				cancelEditingSummary();
			}
			await invalidateAll();
		} catch {
			actionError = 'Could not delete that recap just now.';
			posthog.capture('insight_summary_delete_failed', { reason: 'request_failed' });
		} finally {
			deletingSummaryId = '';
		}
	}

	async function emailSummary(summaryId: string) {
		actionMessage = '';
		actionError = '';
		deleteConfirmInsightId = '';
		deleteConfirmSummaryId = '';
		emailingSummaryId = summaryId;
		const summary = data.summaries.find((item) => item.id === summaryId) ?? activeSummary;
		if (!summary) return;
		posthog.capture('insight_email_requested', {
			prompt_version: summary.promptVersion,
			provider: summary.provider,
			model: summary.model
		});

		try {
			const response = await fetch('/api/ai/insights/email', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ summaryId })
			});

			if (!response.ok) throw new Error('Could not send your summary email.');
			posthog.capture('insight_email_sent', {
				prompt_version: summary.promptVersion,
				provider: summary.provider,
				model: summary.model
			});
			actionMessage = `Sent to ${data.user.email}.`;
			await invalidateAll();
		} catch {
			actionError = 'Could not send your email just now.';
			posthog.capture('insight_email_failed', { reason: 'request_failed' });
		} finally {
			emailingSummaryId = '';
		}
	}

</script>

<svelte:head>
	<title>Account | Pixel Poetry</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="min-h-[calc(100svh-4rem)] bg-cream px-4 py-12 sm:px-6 lg:px-8">
	<div class="mx-auto max-w-(--container-wide)">
		<div
			class="flex flex-col gap-6 border-b border-ink/10 pb-8 md:flex-row md:items-end md:justify-between"
		>
			<div>
				<p
					class="mb-3 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper px-3 py-1 text-xs font-black tracking-[0.18em] text-ink/45 uppercase"
				>
					<Sparkles size={14} aria-hidden="true" />
					Member space
				</p>
				<h1 class="font-display text-5xl font-black text-ink sm:text-6xl">
					Hi, {data.user.name}.
				</h1>
				<p class="mt-4 max-w-2xl text-lg leading-8 text-ink/60">
					Your private shelf for saved passages, notes, and AI recaps from Pixel Poetry essays.
				</p>
			</div>
			<button
				type="button"
				onclick={signOut}
				disabled={signingOut}
				class="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-ink/15 bg-paper px-5 text-sm font-black text-ink transition-colors hover:border-ink/25 hover:bg-cream-soft disabled:cursor-not-allowed disabled:opacity-60"
			>
				<LogOut size={17} aria-hidden="true" />
				{signingOut ? 'Signing out' : 'Sign out'}
			</button>
		</div>

		<div class="mt-8 grid gap-4 lg:grid-cols-3">
			<article class="rounded-lg border border-ink/10 bg-paper p-5">
				<BookOpen class="text-brand-red" size={26} aria-hidden="true" />
				<h2 class="mt-4 font-display text-2xl font-black text-ink">Reading profile</h2>
				<p class="mt-3 text-sm leading-6 text-ink/55">
					Your account is connected as <span class="font-black text-ink">{data.user.email}</span>.
				</p>
			</article>

			<article class="rounded-lg border border-ink/10 bg-paper p-5">
				<Brain class="text-brand-ocean" size={26} aria-hidden="true" />
				<h2 class="mt-4 font-display text-2xl font-black text-ink">AI summaries</h2>
				<p class="mt-3 text-sm leading-6 text-ink/55">
					Generate a private recap from the takeaways you chose to pack.
				</p>
			</article>

			<article class="rounded-lg border border-ink/10 bg-paper p-5">
				<CheckCircle2 class="text-brand-forest" size={26} aria-hidden="true" />
				<h2 class="mt-4 font-display text-2xl font-black text-ink">Saved takeaways</h2>
				<p class="mt-3 text-sm leading-6 text-ink/55">
					You have saved <span class="font-black text-ink">{data.insights.length}</span>
					takeaway{data.insights.length === 1 ? '' : 's'}.
				</p>
			</article>
		</div>

		<div class="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
			<section
				class="rounded-lg border border-ink/10 bg-paper p-5 md:p-6"
				aria-labelledby="saved-insights-title"
			>
				<div
					class="flex flex-col gap-4 border-b border-ink/10 pb-5 md:flex-row md:items-center md:justify-between"
				>
					<div>
						<h2 id="saved-insights-title" class="font-display text-3xl font-black text-ink">
							My takeaways
						</h2>
						<p class="mt-2 text-sm leading-6 text-ink/55">
							Select text in an explainer and tap the lunchbox to pack it here.
						</p>
					</div>
					<button
						type="button"
						onclick={generateSummary}
						disabled={generating || data.migrationPending || selectedInsightCount === 0}
						class="inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-black whitespace-nowrap text-cream transition-colors hover:bg-ink/85 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{#if generating}
							<LoaderCircle class="animate-spin" size={17} aria-hidden="true" />
							Generating
						{:else}
							<Plus size={17} aria-hidden="true" />
							Create recap
						{/if}
					</button>
				</div>

				{#if data.insights.length}
					<div class="mt-5 grid gap-3 border-b border-ink/10 pb-5">
						<label class="relative block">
							<span class="sr-only">Search takeaways</span>
							<Search
								class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink/35"
								size={17}
								aria-hidden="true"
							/>
							<input
								bind:value={takeawaySearch}
								type="search"
								placeholder="Search takeaways"
								class="min-h-11 w-full rounded-md border border-ink/15 bg-cream pr-3 pl-10 text-sm font-bold text-ink placeholder:text-ink/35 focus:border-brand-ocean focus:ring-brand-ocean"
							/>
						</label>

						<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<p class="text-sm font-bold text-ink/55">
								<span class="font-black text-ink">{selectedInsightCount}</span> selected for recap
								{#if takeawaySearch.trim()}
									<span class="text-ink/35">
										/ {filteredInsights.length} result{filteredInsights.length === 1 ? '' : 's'}
									</span>
								{/if}
							</p>
							<div class="flex flex-wrap gap-2">
								<button
									type="button"
									onclick={selectAllTakeaways}
									class="inline-flex min-h-9 cursor-pointer items-center rounded-full border border-ink/15 px-4 text-xs font-black text-ink transition-colors hover:border-ink/25 hover:bg-ink/5"
								>
									Select all
								</button>
								<button
									type="button"
									onclick={toggleFilteredTakeaways}
									disabled={filteredInsights.length === 0}
									class="inline-flex min-h-9 cursor-pointer items-center rounded-full border border-ink/15 px-4 text-xs font-black text-ink transition-colors hover:border-ink/25 hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-45"
								>
									{allFilteredSelected ? 'Unselect results' : 'Select results'}
								</button>
								<button
									type="button"
									onclick={clearSelectedTakeaways}
									disabled={selectedInsightCount === 0}
									class="inline-flex min-h-9 cursor-pointer items-center rounded-full border border-ink/15 px-4 text-xs font-black text-ink transition-colors hover:border-ink/25 hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-45"
								>
									Clear
								</button>
							</div>
						</div>
					</div>
				{/if}

				{#if data.migrationPending}
					<div
						class="mt-5 rounded-md border border-brand-amber/35 bg-brand-amber/10 px-4 py-3 text-sm leading-6 text-ink/70"
					>
						<p class="font-black text-ink">Saved insights are waiting on the database migration.</p>
						<p class="mt-1">
							The UI is ready, but this Neon branch does not have the saved-insights tables yet. Run
							the Neon migration flow before testing saves, recaps, or email delivery here.
						</p>
					</div>
				{/if}

				{#if takeawayActionError}
					<p
						class="mt-4 rounded-md bg-brand-red/10 px-4 py-3 text-sm font-bold text-brand-red-deep"
					>
						{takeawayActionError}
					</p>
				{/if}

				{#if data.insights.length && filteredInsights.length}
					<div class="mt-5 grid gap-4">
						{#each filteredInsights as insight (insight.id)}
							{@const isSelected = selectedInsightIds.includes(insight.id)}
							<article
								class="rounded-md border bg-cream p-4 transition-colors {isSelected
									? 'border-brand-amber/55'
									: 'border-ink/10'}"
							>
								<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
									<div
										class="flex flex-wrap items-center gap-2 text-xs font-black tracking-[0.14em] text-ink/40 uppercase"
									>
										<span>{insight.explainerSlug}</span>
										<span aria-hidden="true">/</span>
										<span>{insight.chapterId}</span>
									</div>
									<button
										type="button"
										onclick={() => requestDeleteInsight(insight.id)}
										disabled={deletingInsightId === insight.id || data.migrationPending}
										class={`group relative inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
											deleteConfirmInsightId === insight.id
												? 'bg-brand-red/10 text-brand-red-deep ring-1 ring-brand-red/25'
												: 'text-ink/35 hover:bg-brand-red/10 hover:text-brand-red-deep'
										}`}
										aria-label={deleteConfirmInsightId === insight.id ? 'Confirm delete takeaway' : 'Delete takeaway'}
										title={deleteConfirmInsightId === insight.id ? 'Sure?' : 'Delete takeaway'}
									>
										{#if deletingInsightId === insight.id}
											<LoaderCircle class="animate-spin" size={15} aria-hidden="true" />
										{:else}
											<Trash2 size={15} aria-hidden="true" />
										{/if}
										{#if deleteConfirmInsightId === insight.id}
											<span
												class="pointer-events-none absolute top-1/2 right-6 z-0 flex h-8 -translate-y-1/2 items-center rounded-l-full border border-r-0 border-brand-red/20 bg-brand-red/10 pr-4 pl-3 text-[11px] font-bold whitespace-nowrap text-brand-red-deep"
											>
												Sure?
											</span>
										{/if}
									</button>
								</div>
								<blockquote
									class="mt-3 border-l-4 border-brand-amber pl-4 text-base leading-7 text-ink/80"
								>
									{insight.selectedText}
								</blockquote>
								{#if insight.note}
									<p class="mt-3 rounded-md bg-paper px-3 py-2 text-sm leading-6 text-ink/60">
										<span class="font-black text-ink">Note:</span>
										{insight.note}
									</p>
								{/if}
								<div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
									<p class="text-xs font-semibold text-ink/35">
										{displayDate(insight.createdAt)}
									</p>
									<label
										class="inline-flex w-fit cursor-pointer items-center gap-2 self-end text-xs font-black text-ink"
									>
										<input
											type="checkbox"
											checked={isSelected}
											onchange={() => toggleTakeaway(insight.id)}
											class="size-4 rounded border-ink/25 text-ink focus:ring-brand-ocean"
										/>
										<span>Add to recap</span>
									</label>
								</div>
							</article>
						{/each}
					</div>
				{:else if data.insights.length}
					<div
						class="mt-6 rounded-md border border-dashed border-ink/15 bg-cream p-6 text-sm leading-7 text-ink/55"
					>
						No takeaways match that search.
					</div>
				{:else}
					<div
						class="mt-6 rounded-md border border-dashed border-ink/15 bg-cream p-6 text-sm leading-7 text-ink/55"
					>
						Highlight a sentence or paragraph in an explainer, then tap 🥡 Takeaway.
					</div>
				{/if}
			</section>

			<aside
				class="rounded-lg border border-ink/10 bg-paper p-5 md:p-6"
				aria-labelledby="recaps-title"
			>
				<div class="flex items-start justify-between gap-4 border-b border-ink/10 pb-5">
					<div>
						<h2 id="recaps-title" class="font-display text-3xl font-black text-ink">My recaps</h2>
						<p class="mt-2 text-sm leading-6 text-ink/55">
							Keep up to <span class="font-black text-ink">5</span> private AI recaps.
						</p>
					</div>
					<span
						class="inline-flex min-h-8 items-center rounded-full border border-ink/10 px-3 text-xs font-black text-ink/45"
					>
						{recapsLeft} left
					</span>
				</div>

				{#if actionMessage}
					<p
						class="mt-4 rounded-md bg-brand-forest/10 px-4 py-3 text-sm font-bold text-brand-forest"
					>
						{actionMessage}
					</p>
				{/if}
				{#if actionError}
					<p
						class="mt-4 rounded-md bg-brand-red/10 px-4 py-3 text-sm font-bold text-brand-red-deep"
					>
						{actionError}
					</p>
				{/if}

				{#if data.summaries.length}
					<ul class="mt-5 space-y-3">
						{#each data.summaries as summary, index (summary.id)}
							<li
								class="rounded-md border border-ink/10 bg-cream px-3 py-3 transition-colors hover:border-brand-ocean/35"
							>
								<div class="flex items-start justify-between gap-3">
									<button
										type="button"
										onclick={() => openSummary(summary.id)}
										class="min-w-0 flex-1 cursor-pointer text-left"
									>
										<span class="block text-xs font-black tracking-[0.14em] text-ink/40 uppercase">
											{index === 0 ? 'Latest' : `Recap ${data.summaries.length - index}`} / {summary.provider}
										</span>
										<span class="mt-1 line-clamp-2 block font-display text-lg font-black text-ink">
											{summary.summaryJson.title}
										</span>
										<span class="mt-1 block text-xs font-semibold text-ink/40">
											{displayDate(summary.createdAt)} / {summary.insightCount}
											takeaway{summary.insightCount === 1 ? '' : 's'}
										</span>
									</button>
									<div class="flex shrink-0 gap-1">
										<button
											type="button"
											onclick={() => openSummary(summary.id)}
											class="inline-flex min-h-9 min-w-9 cursor-pointer items-center justify-center rounded-full text-ink/55 transition-colors hover:bg-paper hover:text-ink"
											aria-label="Open recap"
										>
											<Eye size={16} aria-hidden="true" />
										</button>
										<button
											type="button"
											onclick={() => emailSummary(summary.id)}
											disabled={emailingSummaryId === summary.id || data.migrationPending}
											class="inline-flex min-h-9 min-w-9 cursor-pointer items-center justify-center rounded-full text-ink/55 transition-colors hover:bg-paper hover:text-ink disabled:cursor-not-allowed disabled:opacity-45"
											aria-label="Email recap"
										>
											{#if emailingSummaryId === summary.id}
												<LoaderCircle class="animate-spin" size={16} aria-hidden="true" />
											{:else}
												<Mail size={16} aria-hidden="true" />
											{/if}
										</button>
										<button
											type="button"
											onclick={() => requestDeleteSummary(summary.id)}
											disabled={deletingSummaryId === summary.id || data.migrationPending}
											class={`relative inline-flex min-h-9 min-w-9 cursor-pointer items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
												deleteConfirmSummaryId === summary.id
													? 'bg-brand-red/10 text-brand-red-deep ring-1 ring-brand-red/30'
													: 'text-ink/45 hover:bg-brand-red/10 hover:text-brand-red-deep'
											}`}
											aria-label={deleteConfirmSummaryId === summary.id ? 'Confirm delete recap' : 'Delete recap'}
											title={deleteConfirmSummaryId === summary.id ? 'Sure?' : 'Delete recap'}
										>
											{#if deletingSummaryId === summary.id}
												<LoaderCircle class="animate-spin" size={16} aria-hidden="true" />
											{:else}
												<Trash2 size={16} aria-hidden="true" />
											{/if}
											{#if deleteConfirmSummaryId === summary.id}
												<span
													class="pointer-events-none absolute top-1/2 right-7 z-0 flex h-9 -translate-y-1/2 items-center rounded-l-full border border-r-0 border-brand-red/20 bg-brand-red/10 pr-4 pl-3 text-[11px] font-bold whitespace-nowrap text-brand-red-deep"
												>
													Sure?
												</span>
											{/if}
										</button>
									</div>
								</div>
							</li>
						{/each}
					</ul>
				{:else}
					<p
						class="mt-5 rounded-md border border-dashed border-ink/15 bg-cream p-5 text-sm leading-7 text-ink/55"
					>
						Choose one or more takeaways, then add them to a recap. New recaps will appear here as a
						compact shelf.
					</p>
				{/if}

			</aside>
		</div>
	</div>
</section>

<Sheet bind:open={recapSheetOpen} title="Recap" resetKey={activeSummary?.id}>
	{#if activeSummary}
		<div class="mx-auto max-w-4xl">
			<div class="grid gap-5 border-b border-ink/10 pb-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
				<div class="min-w-0">
					<p class="text-xs font-black tracking-[0.14em] text-ink/40 uppercase">
						{activeSummary.provider} / {activeSummary.model}
					</p>
					{#if editingSummaryId === activeSummary.id}
						<label class="mt-4 block">
							<span class="sr-only">Recap title</span>
							<input
								bind:value={editTitle}
								class="w-full rounded-md border border-ink/15 bg-paper px-3 py-2 font-display text-2xl font-black text-ink focus:border-brand-ocean focus:ring-brand-ocean"
							/>
						</label>
					{:else}
						<h3 class="mt-3 font-display text-3xl font-black text-ink md:text-4xl">
							{activeSummary.summaryJson.title}
						</h3>
					{/if}
				</div>
				<div
					class="flex w-fit items-center gap-1 rounded-full border border-ink/10 bg-paper/80 p-1"
					aria-label="Recap actions"
				>
					<button
						type="button"
						onclick={startEditingSummary}
						disabled={editingSummaryId === activeSummary.id}
						class="inline-flex size-10 cursor-pointer items-center justify-center rounded-full text-ink/65 transition-colors hover:bg-ink/5 hover:text-ink disabled:cursor-not-allowed disabled:opacity-45"
						aria-label="Edit recap"
						title="Edit"
					>
						<Pencil size={15} aria-hidden="true" />
					</button>
					<button
						type="button"
						onclick={() => emailSummary(activeSummary.id)}
						disabled={emailingSummaryId === activeSummary.id || data.migrationPending}
						class="inline-flex size-10 cursor-pointer items-center justify-center rounded-full bg-brand-red-deep text-cream transition-colors hover:bg-brand-red disabled:cursor-not-allowed disabled:opacity-60"
						aria-label="Email recap"
						title="Email"
					>
						{#if emailingSummaryId === activeSummary.id}
							<LoaderCircle class="animate-spin" size={15} aria-hidden="true" />
						{:else}
							<Mail size={15} aria-hidden="true" />
						{/if}
					</button>
					<button
						type="button"
						onclick={() => requestDeleteSummary(activeSummary.id)}
						disabled={deletingSummaryId === activeSummary.id || data.migrationPending}
						class={`relative inline-flex size-10 cursor-pointer items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
							deleteConfirmSummaryId === activeSummary.id
								? 'bg-brand-red/10 text-brand-red-deep ring-1 ring-brand-red/25'
								: 'text-brand-red-deep/75 hover:bg-brand-red/10 hover:text-brand-red-deep'
						}`}
						aria-label={deleteConfirmSummaryId === activeSummary.id ? 'Confirm delete recap' : 'Delete recap'}
						title={deleteConfirmSummaryId === activeSummary.id ? 'Sure?' : 'Delete'}
					>
						{#if deletingSummaryId === activeSummary.id}
							<LoaderCircle class="animate-spin" size={15} aria-hidden="true" />
						{:else if deleteConfirmSummaryId === activeSummary.id}
							<Trash2 size={15} aria-hidden="true" />
						{:else}
							<Trash2 size={15} aria-hidden="true" />
						{/if}
						{#if deleteConfirmSummaryId === activeSummary.id}
							<span
								class="pointer-events-none absolute top-1/2 right-8 z-0 flex h-10 -translate-y-1/2 items-center rounded-l-full border border-r-0 border-brand-red/20 bg-brand-red/10 pr-5 pl-3 text-[11px] font-bold whitespace-nowrap text-brand-red-deep"
							>
								Sure?
							</span>
						{/if}
					</button>
				</div>
			</div>

			<div class="mt-5 flex flex-wrap gap-2">
				<a
					href={pixelPoetryHomeHref}
					class="inline-flex min-h-9 items-center gap-2 rounded-full border border-ink/10 px-3 text-xs font-black text-ink transition-colors hover:bg-ink/5"
				>
					Pixel Poetry
					<ExternalLink size={13} aria-hidden="true" />
				</a>
				<a
					href={activeSummaryExplainerHref}
					class="inline-flex min-h-9 items-center gap-2 rounded-full border border-ink/10 px-3 text-xs font-black text-ink transition-colors hover:bg-ink/5"
				>
					{activeSummary.explainerSlug === 'all'
						? 'All explainers'
						: explainerLabel(activeSummary.explainerSlug)}
					<ExternalLink size={13} aria-hidden="true" />
				</a>
			</div>

			{#if editingSummaryId === activeSummary.id}
				<div class="mt-6 grid gap-4">
					<label class="block">
						<span class="text-xs font-black tracking-[0.14em] text-ink/45 uppercase">Overview</span>
						<textarea
							bind:value={editOverview}
							rows="5"
							class="mt-2 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm leading-7 text-ink focus:border-brand-ocean focus:ring-brand-ocean"
						></textarea>
					</label>
					<label class="block">
						<span class="text-xs font-black tracking-[0.14em] text-ink/45 uppercase">
							Shareable summary
						</span>
						<textarea
							bind:value={editShareableSummary}
							rows="4"
							class="mt-2 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm leading-7 text-ink focus:border-brand-ocean focus:ring-brand-ocean"
						></textarea>
					</label>
					<div class="flex flex-wrap gap-2">
						<button
							type="button"
							onclick={saveSummaryEdit}
							disabled={savingSummaryEdit}
							class="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-ink px-5 text-sm font-black text-cream transition-colors hover:bg-ink/85 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{#if savingSummaryEdit}
								<LoaderCircle class="animate-spin" size={16} aria-hidden="true" />
								Saving
							{:else}
								<Save size={16} aria-hidden="true" />
								Save changes
							{/if}
						</button>
						<button
							type="button"
							onclick={cancelEditingSummary}
							class="inline-flex min-h-10 cursor-pointer items-center rounded-full border border-ink/15 px-5 text-sm font-black text-ink transition-colors hover:border-ink/25 hover:bg-ink/5"
						>
							Cancel
						</button>
					</div>
				</div>
			{:else}
				<p class="mt-6 text-base leading-8 text-ink/70">
					{activeSummary.summaryJson.overview}
				</p>
			{/if}

			<h4 class="mt-7 text-sm font-black tracking-[0.14em] text-ink/45 uppercase">Key takeaways</h4>
			<ul class="mt-3 space-y-2 text-sm leading-7 text-ink/70">
				{#each activeSummary.summaryJson.keyTakeaways as takeaway (takeaway)}
					<li class="flex gap-2">
						<span aria-hidden="true" class="mt-3 size-1.5 shrink-0 rounded-full bg-brand-red"
						></span>
						<span>{takeaway}</span>
					</li>
				{/each}
			</ul>

			<h4 class="mt-7 text-sm font-black tracking-[0.14em] text-ink/45 uppercase">Memory hooks</h4>
			<ul class="mt-3 grid gap-2 sm:grid-cols-2">
				{#each activeSummary.summaryJson.memoryHooks as hook (hook)}
					<li
						class="rounded-md border border-ink/10 bg-paper px-3 py-2 text-sm leading-6 text-ink/65"
					>
						{hook}
					</li>
				{/each}
			</ul>

			{#if editingSummaryId !== activeSummary.id}
				<h4 class="mt-7 text-sm font-black tracking-[0.14em] text-ink/45 uppercase">
					Shareable summary
				</h4>
				<p
					class="mt-3 rounded-md border border-ink/10 bg-paper px-4 py-3 text-sm leading-7 text-ink/70"
				>
					{activeSummary.summaryJson.shareableSummary}
				</p>
			{/if}

			{#if activeSummaryInsights.length}
				<div class="mt-7 border-t border-ink/10 pt-5">
					<h4 class="text-sm font-black tracking-[0.14em] text-ink/45 uppercase">
						Recapped pieces
					</h4>
					<ul class="mt-3 grid gap-2 md:grid-cols-2">
						{#each activeSummaryInsights as insight (insight.id)}
							<li>
								<a
									href={insightHref(insight)}
									class="group block rounded-md border border-ink/10 bg-paper px-3 py-3 text-sm transition-colors hover:border-brand-ocean/40 hover:bg-cream-soft"
								>
									<span
										class="flex items-center justify-between gap-3 text-xs font-black tracking-[0.14em] text-ink/40 uppercase"
									>
										<span>{explainerLabel(insight.explainerSlug)}</span>
										<ExternalLink
											class="shrink-0 text-ink/30 group-hover:text-brand-ocean"
											size={14}
											aria-hidden="true"
										/>
									</span>
									<span class="mt-1 block font-black text-ink">
										{chapterLabel(insight.chapterId)}
									</span>
									<span class="mt-1 line-clamp-2 block leading-6 text-ink/60">
										{insight.selectedText}
									</span>
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if activeSummary.summaryJson.sources?.length}
				<div class="mt-7 border-t border-ink/10 pt-5">
					<h4 class="text-sm font-black tracking-[0.14em] text-ink/45 uppercase">
						Sources behind this recap
					</h4>
					<ul class="mt-3 grid gap-2 md:grid-cols-2">
						{#each activeSummary.summaryJson.sources as source (`${source.sourceId}-${source.support}`)}
							<li class="rounded-md border border-ink/10 bg-paper px-3 py-3 text-sm">
								<div class="flex items-start justify-between gap-3">
									<div>
										<p class="font-black text-ink">{source.short}</p>
										<p class="mt-1 leading-6 text-ink/60">{source.support}</p>
									</div>
									{#if source.url}
										<a
											href={source.url}
											target="_blank"
											rel="noopener"
											class="shrink-0 rounded-full p-1 text-ink/35 transition-colors hover:bg-ink/5 hover:text-brand-ocean"
											aria-label={`Open ${source.short}`}
										>
											<ExternalLink size={15} aria-hidden="true" />
										</a>
									{/if}
								</div>
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if activeSummaryDeliveries.length}
				<div class="mt-7 border-t border-ink/10 pt-5">
					<h4 class="text-sm font-black tracking-[0.14em] text-ink/45 uppercase">Email log</h4>
					<ul class="mt-3 grid gap-2">
						{#each activeSummaryDeliveries as delivery (delivery.id)}
							<li
								class="flex flex-col gap-1 rounded-md border border-ink/10 bg-paper px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
							>
								<span class="font-black text-ink">{statusLabel(delivery.status)}</span>
								<span class="text-xs font-semibold text-ink/45">
									{displayDate(delivery.createdAt)}
								</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	{/if}
</Sheet>
