<script lang="ts">
	/**
	 * <SourceSheet> — a single bottom sheet that handles both bibliographic
	 * sources (opened by StatCard, QuoteBlock, ObsBarChart) and inline term
	 * definitions (opened by [data-term] links in story text).
	 */
	import { initSheetContext, type SheetPayload } from '$lib/context/sheet';
	import { getExplainerHolder } from '$lib/context/explainer.svelte';
	import Sheet from '$lib/components/ui/Sheet.svelte';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import { posthog } from '$lib/analytics/posthog';

	const explainerHolder = getExplainerHolder();
	const explainer = $derived(explainerHolder?.current ?? null);

	let open = $state(false);
	let payload = $state<SheetPayload | null>(null);

	const activeSource = $derived(
		payload?.kind === 'source' ? (explainer?.getSource(payload.id) ?? null) : null
	);
	const activeTerm = $derived(
		payload?.kind === 'term' ? (explainer?.getTerm(payload.id) ?? null) : null
	);

	initSheetContext((p: SheetPayload) => {
		payload = p;
		open = true;
	});
</script>

<Sheet
	bind:open
	title={activeTerm ? 'Annotation' : 'Source'}
	resetKey={payload ? `${payload.kind}:${payload.id}` : null}
>
	<!-- ── TERM / ANNOTATION VIEW ────────────────────────────────────── -->
	{#if activeTerm}
		<div class="flex flex-col gap-6">
			<h3 class="font-display text-2xl font-bold text-ink">{activeTerm.name}</h3>

			<p class="text-xl leading-snug font-medium text-ink">{activeTerm.short}</p>

			<div class="prose-annotation text-lg leading-relaxed text-ink/70">
				{@html activeTerm.long}
			</div>

			{#if activeTerm.url}
				<div class="border-t border-ink/10 pt-4">
					<a
						href={activeTerm.url}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/60 underline underline-offset-2 hover:text-brand-red"
					>
						{activeTerm.urlLabel ?? 'Learn more'}
						<ArrowUpRight size={14} aria-hidden="true" />
					</a>
				</div>
			{/if}

			{#if activeTerm.references?.length}
				<div class="flex flex-col gap-3 border-t border-ink/10 pt-4">
					<p class="text-xs font-bold tracking-widest text-ink/40 uppercase">Sources mentioned</p>
					{#each activeTerm.references as ref}
						<a
							href={ref.url}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/60 underline underline-offset-2 transition-colors hover:text-brand-red"
							onclick={() =>
								posthog.capture('term_external_link_clicked', {
									term_id: activeTerm!.id,
									source_url: ref.url
								})}
						>
							{ref.label}
							<ArrowUpRight size={13} aria-hidden="true" />
						</a>
					{/each}
				</div>
			{/if}
		</div>

		<!-- ── SOURCE VIEW ───────────────────────────────────────────────── -->
	{:else if activeSource}
		<div class="flex flex-col gap-6">
			<div class="flex items-center gap-3">
				<span
					class="inline-block rounded-full bg-brand-amber/15 px-3 py-1 font-body text-xs font-bold tracking-widest text-brand-amber uppercase"
				>
					{activeSource.year}
				</span>
				{#if activeSource.url}
					<a
						href={activeSource.url}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1 text-sm font-semibold text-ink/60 underline underline-offset-2 transition-colors hover:text-brand-red"
						onclick={() =>
							posthog.capture('source_external_link_clicked', {
								source_id: activeSource!.id,
								source_url: activeSource!.url
							})}
					>
						{activeSource.id === 'van-tulleken-2023'
							? 'View on Goodreads'
							: activeSource.id === 'olp-2026'
								? 'Read report PDF'
								: 'View source'}
						<ArrowUpRight size={14} aria-hidden="true" />
					</a>
				{/if}
			</div>

			<h3 class="font-display text-2xl font-bold text-ink">{activeSource.short}</h3>

			<p class="text-lg leading-relaxed text-ink/80">{activeSource.full}</p>

			<div class="border-t border-ink/10 pt-4">
				<p class="text-sm text-ink/50">
					Part of the evidence base for this explainer. Sources include public reports, journal
					articles, datasets, books, and cited media coverage.
				</p>
			</div>

			{#if activeSource.references?.length}
				<div class="flex flex-col gap-3 border-t border-ink/10 pt-4">
					<p class="text-xs font-bold tracking-widest text-ink/40 uppercase">Notes and links</p>
					{#each activeSource.references as ref}
						<div class="flex flex-col gap-1">
							<p class="text-sm leading-relaxed text-ink/70">{ref.citation}</p>
							{#if ref.url}
								<a
									href={ref.url}
									target="_blank"
									rel="noopener noreferrer"
									class="inline-flex items-center gap-1 text-xs font-semibold text-ink/50 underline underline-offset-2 transition-colors hover:text-brand-red"
									onclick={() =>
										posthog.capture('source_external_link_clicked', {
											source_id: activeSource!.id,
											source_url: ref.url
										})}
								>
									View study <ArrowUpRight size={12} aria-hidden="true" />
								</a>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</Sheet>

<style>
	:global(.prose-annotation p) {
		margin-bottom: 0.85em;
	}
	:global(.prose-annotation p:last-child) {
		margin-bottom: 0;
	}
	:global(.prose-annotation ul) {
		list-style: disc;
		padding-left: 1.4em;
		margin-bottom: 0.85em;
		display: flex;
		flex-direction: column;
		gap: 0.35em;
	}
	:global(.prose-annotation strong) {
		font-weight: 700;
		color: #0a0a0a;
	}
</style>
