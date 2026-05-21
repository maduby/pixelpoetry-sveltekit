<script lang="ts">
	/**
	 * <SourceSheet> — a single bottom sheet that handles both bibliographic
	 * sources (opened by StatCard, QuoteBlock, ObsBarChart) and inline term
	 * definitions (opened by [data-term] links in story text).
	 */
	import { initSheetContext, type SheetPayload } from '$lib/context/sheet';
	import { getActiveExplainer } from '$lib/context/explainer.svelte';
	import Sheet from '$lib/components/ui/Sheet.svelte';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import { posthog } from '$lib/analytics/posthog';

	const explainer = $derived(getActiveExplainer());

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

<Sheet bind:open title={activeTerm ? 'Annotation' : 'Source'}>
	<!-- ── TERM / ANNOTATION VIEW ────────────────────────────────────── -->
	{#if activeTerm}
		<div class="flex flex-col gap-6">
			<span
				class="inline-block w-fit rounded-full bg-brand-amber/15 px-3 py-1 font-body text-xs font-bold uppercase tracking-widest text-brand-amber"
			>
				Annotation
			</span>

			<h3 class="font-display text-2xl font-bold text-ink">{activeTerm.name}</h3>

			<p class="text-xl font-medium leading-snug text-ink">{activeTerm.short}</p>

			<p class="text-lg leading-relaxed text-ink/70">{activeTerm.long}</p>

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
		</div>

	<!-- ── SOURCE VIEW ───────────────────────────────────────────────── -->
	{:else if activeSource}
		<div class="flex flex-col gap-6">
			<div class="flex items-center gap-3">
				<span
					class="inline-block rounded-full bg-brand-amber/15 px-3 py-1 font-body text-xs font-bold uppercase tracking-widest text-brand-amber"
				>
					{activeSource.year}
				</span>
				{#if activeSource.url}
					<a
						href={activeSource.url}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1 text-sm font-semibold text-ink/60 underline underline-offset-2 transition-colors hover:text-brand-red"
						onclick={() => posthog.capture('source_external_link_clicked', { source_id: activeSource!.id, source_url: activeSource!.url })}
					>
						{activeSource.id === 'van-tulleken-2023' ? 'View on Goodreads' : 'View source'}
						<ArrowUpRight size={14} aria-hidden="true" />
					</a>
				{/if}
			</div>

			<h3 class="font-display text-2xl font-bold text-ink">{activeSource.short}</h3>

			<p class="text-lg leading-relaxed text-ink/80">{activeSource.full}</p>

			<div class="border-t border-ink/10 pt-4">
				<p class="text-sm text-ink/50">
					Part of the evidence base for the Ultra-Processed investigation.
					All sources are publicly available and peer-reviewed.
				</p>
			</div>

			{#if activeSource.references?.length}
				<div class="border-t border-ink/10 pt-4 flex flex-col gap-3">
					<p class="text-xs font-bold uppercase tracking-widest text-ink/40">Primary studies cited</p>
					{#each activeSource.references as ref}
						<div class="flex flex-col gap-1">
							<p class="text-sm leading-relaxed text-ink/70">{ref.citation}</p>
							{#if ref.url}
								<a
									href={ref.url}
									target="_blank"
									rel="noopener noreferrer"
									class="inline-flex items-center gap-1 text-xs font-semibold text-ink/50 underline underline-offset-2 transition-colors hover:text-brand-red"
									onclick={() => posthog.capture('source_external_link_clicked', { source_id: activeSource!.id, source_url: ref.url })}
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
