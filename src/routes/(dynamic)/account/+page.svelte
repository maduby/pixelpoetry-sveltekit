<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';
	import { authClient } from '$lib/auth-client';
	import BookOpen from 'lucide-svelte/icons/book-open';
	import Brain from 'lucide-svelte/icons/brain';
	import CheckCircle2 from 'lucide-svelte/icons/check-circle-2';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import LogOut from 'lucide-svelte/icons/log-out';
	import Mail from 'lucide-svelte/icons/mail';
	import RefreshCw from 'lucide-svelte/icons/refresh-cw';
	import Sparkles from 'lucide-svelte/icons/sparkles';
	import { posthog } from '$lib/analytics/posthog';

	let { data }: PageProps = $props();
	let signingOut = $state(false);
	let generating = $state(false);
	let emailing = $state(false);
	let smokeTesting = $state(false);
	let actionMessage = $state('');
	let actionError = $state('');

	const latestSummary = $derived(data.summaries[0]);

	async function signOut() {
		signingOut = true;
		await authClient.signOut();
		await invalidateAll();
		await goto(resolve('/'));
	}

	async function generateSummary() {
		actionMessage = '';
		actionError = '';
		generating = true;
		posthog.capture('insight_summary_requested', {
			saved_insight_count: data.insights.length
		});

		try {
			const response = await fetch('/api/ai/insights/summary', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({})
			});

			if (!response.ok) throw new Error('Could not generate your saved-insights summary.');
			const result = await response.json();
			posthog.capture('insight_summary_completed', {
				provider: result.provider,
				model: result.model,
				prompt_version: result.promptVersion,
				saved_insight_count: data.insights.length
			});
			actionMessage = 'Your saved-insights summary is ready.';
			await invalidateAll();
		} catch {
			actionError = 'Could not generate your summary just now.';
			posthog.capture('insight_summary_failed', {
				reason: 'request_failed',
				saved_insight_count: data.insights.length
			});
		} finally {
			generating = false;
		}
	}

	async function emailSummary() {
		if (!latestSummary) return;
		actionMessage = '';
		actionError = '';
		emailing = true;
		posthog.capture('insight_email_requested', {
			prompt_version: latestSummary.promptVersion,
			provider: latestSummary.provider,
			model: latestSummary.model
		});

		try {
			const response = await fetch('/api/ai/insights/email', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ summaryId: latestSummary.id })
			});

			if (!response.ok) throw new Error('Could not send your summary email.');
			posthog.capture('insight_email_sent', {
				prompt_version: latestSummary.promptVersion,
				provider: latestSummary.provider,
				model: latestSummary.model
			});
			actionMessage = `Sent to ${data.user.email}.`;
			await invalidateAll();
		} catch {
			actionError = 'Could not send your email just now.';
			posthog.capture('insight_email_failed', { reason: 'request_failed' });
		} finally {
			emailing = false;
		}
	}

	async function sendSmokeEmail() {
		actionMessage = '';
		actionError = '';
		smokeTesting = true;

		try {
			const response = await fetch('/api/ai/insights/email/smoke', { method: 'POST' });
			if (!response.ok) throw new Error('Could not send the test email.');
			actionMessage = `Test email sent to ${data.user.email}.`;
			await invalidateAll();
		} catch {
			actionError = 'Could not send the test email just now.';
		} finally {
			smokeTesting = false;
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
				class="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-ink/15 bg-paper px-4 text-sm font-black text-ink transition-colors hover:bg-cream-soft disabled:cursor-not-allowed disabled:opacity-60"
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
						disabled={generating || data.migrationPending || data.insights.length === 0}
						class="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-black text-cream transition-colors hover:bg-ink/85 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{#if generating}
							<LoaderCircle class="animate-spin" size={17} aria-hidden="true" />
							Generating
						{:else}
							<RefreshCw size={17} aria-hidden="true" />
							Generate recap
						{/if}
					</button>
				</div>

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

				{#if data.insights.length}
					<div class="mt-5 grid gap-4">
						{#each data.insights as insight (insight.id)}
							<article class="rounded-md border border-ink/10 bg-cream p-4">
								<div
									class="flex flex-wrap items-center gap-2 text-xs font-black tracking-[0.14em] text-ink/40 uppercase"
								>
									<span>{insight.explainerSlug}</span>
									<span aria-hidden="true">/</span>
									<span>{insight.chapterId}</span>
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
								<p class="mt-3 text-xs font-semibold text-ink/35">
									{new Date(insight.createdAt).toLocaleDateString()}
								</p>
							</article>
						{/each}
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
				aria-labelledby="recap-title"
			>
				<h2 id="recap-title" class="font-display text-3xl font-black text-ink">Latest recap</h2>

				{#if latestSummary}
					<p class="mt-2 text-xs font-black tracking-[0.14em] text-ink/40 uppercase">
						{latestSummary.provider} / {latestSummary.model}
					</p>
					<h3 class="mt-5 font-display text-2xl font-black text-ink">
						{latestSummary.summaryJson.title}
					</h3>
					<p class="mt-3 text-sm leading-7 text-ink/65">
						{latestSummary.summaryJson.overview}
					</p>
					<h4 class="mt-5 text-sm font-black tracking-[0.14em] text-ink/45 uppercase">
						Key takeaways
					</h4>
					<ul class="mt-3 space-y-2 text-sm leading-6 text-ink/65">
						{#each latestSummary.summaryJson.keyTakeaways as takeaway (takeaway)}
							<li class="flex gap-2">
								<span aria-hidden="true" class="mt-2 size-1.5 shrink-0 rounded-full bg-brand-red"
								></span>
								<span>{takeaway}</span>
							</li>
						{/each}
					</ul>
					<div class="mt-6 flex flex-col gap-3">
						<button
							type="button"
							onclick={emailSummary}
							disabled={emailing || data.migrationPending}
							class="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-brand-red-deep px-4 text-sm font-black text-cream transition-colors hover:bg-brand-red disabled:cursor-not-allowed disabled:opacity-60"
						>
							{#if emailing}
								<LoaderCircle class="animate-spin" size={17} aria-hidden="true" />
								Sending
							{:else}
								<Mail size={17} aria-hidden="true" />
								Email me this recap
							{/if}
						</button>
						<button
							type="button"
							onclick={sendSmokeEmail}
							disabled={smokeTesting || data.migrationPending}
							class="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-ink/15 px-4 text-sm font-black text-ink transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{#if smokeTesting}
								<LoaderCircle class="animate-spin" size={17} aria-hidden="true" />
								Checking
							{:else}
								<Mail size={17} aria-hidden="true" />
								Send test email
							{/if}
						</button>
					</div>
				{:else}
					<p class="mt-4 text-sm leading-7 text-ink/55">
						Pack a takeaway, then generate a recap to see personalised AI notes here.
					</p>
				{/if}

				{#if data.deliveries.length}
					<div class="mt-6 border-t border-ink/10 pt-5">
						<h4 class="text-sm font-black tracking-[0.14em] text-ink/45 uppercase">Email log</h4>
						<ul class="mt-3 space-y-2 text-xs font-semibold text-ink/45">
							{#each data.deliveries as delivery (delivery.id)}
								<li>{delivery.status} / {new Date(delivery.createdAt).toLocaleString()}</li>
							{/each}
						</ul>
					</div>
				{/if}
			</aside>
		</div>
	</div>
</section>
