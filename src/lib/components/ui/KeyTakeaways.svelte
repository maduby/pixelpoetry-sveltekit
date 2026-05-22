<script lang="ts">
	import ChevronsRight from 'lucide-svelte/icons/chevrons-right';
	import PanelLeftOpen from 'lucide-svelte/icons/panel-left-open';
	import X from 'lucide-svelte/icons/x';
	import type { KeyTakeaway } from '$lib/context/explainer.svelte';
	import { cn } from '$lib/utils/cn';

	interface Props {
		items: readonly KeyTakeaway[];
		variant?: 'top' | 'bottom' | 'chapter';
		accent?: 'forest' | 'warning';
		slug?: string;
		summary?: string;
		eyebrow?: string;
		title?: string;
		buttonLabel?: string;
		buttonAriaLabel?: string;
		onOpen?: () => void;
	}

	let {
		items,
		variant = 'top',
		accent = 'forest',
		slug = 'explainer',
		summary,
		eyebrow = 'Key takeaways',
		title = 'TL;DR',
		buttonLabel,
		buttonAriaLabel,
		onOpen
	}: Props = $props();

	let mounted = $state(false);
	let visible = $state(false);
	let contentEl = $state<HTMLDivElement | undefined>(undefined);
	const titleId = $derived(`${slug}-${variant}-takeaways-title`);
	const panelId = $derived(`${slug}-takeaways-panel`);
	const hasContent = $derived(items.length > 0 || !!summary);
	const openLabel = $derived(buttonLabel ?? (variant === 'chapter' ? 'TL;DR' : 'Open takeaways'));
	const contentKey = $derived(`${summary ?? ''}:${items.map((item) => item.text).join('|')}`);
	const accentClass = $derived(
		accent === 'forest'
			? 'border-brand-forest/25 text-brand-forest'
			: 'border-brand-amber/30 text-brand-amber-deep'
	);
	const buttonClass = $derived(
		accent === 'forest'
			? 'border-brand-forest/25 text-brand-forest hover:border-brand-forest/50 hover:bg-brand-forest/8'
			: 'border-brand-amber/30 text-brand-amber-deep hover:border-brand-amber/50 hover:bg-brand-amber/10'
	);
	const linkClass = $derived(
		accent === 'forest'
			? 'text-brand-forest hover:text-brand-forest-deep'
			: 'text-brand-amber-deep hover:text-brand-red'
	);

	function resetPanelScroll() {
		requestAnimationFrame(() => {
			contentEl?.scrollTo({ top: 0, left: 0 });
		});
	}

	function openPanel() {
		mounted = true;
		onOpen?.();
		resetPanelScroll();
		requestAnimationFrame(() => {
			visible = true;
			resetPanelScroll();
		});
	}

	function closePanel() {
		visible = false;
		window.setTimeout(() => {
			mounted = false;
		}, 300);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') closePanel();
	}

	$effect(() => {
		contentKey;
		if (mounted) resetPanelScroll();
	});

	function goToTakeaway(item: KeyTakeaway) {
		if (!item.href) return;
		const id = item.href.slice(1);
		const scrollToTarget = () => {
			document.getElementById(id)?.scrollIntoView({ block: 'start' });
		};

		if (mounted) {
			closePanel();
			window.setTimeout(scrollToTarget, 160);
		} else {
			scrollToTarget();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#snippet panel()}
	{#if mounted}
		<div
			class={cn(
				'fixed inset-0 z-[80] transition-[background-color,backdrop-filter] duration-300 ease-out',
				visible ? 'bg-ink/30 backdrop-blur-sm' : 'bg-ink/0 backdrop-blur-none'
			)}
		>
			<button
				type="button"
				class="absolute inset-0 cursor-default"
				aria-label="Close takeaways"
				onclick={closePanel}
			></button>
			<div
				id={panelId}
				class={cn(
					'relative ml-auto flex h-full w-[min(92vw,28rem)] flex-col bg-cream shadow-2xl',
					'transition-transform duration-300 ease-out motion-reduce:transition-none',
					visible ? 'translate-x-0' : 'translate-x-full'
				)}
				role="dialog"
				aria-modal="true"
				aria-labelledby={`${panelId}-title`}
			>
				<div class="flex items-start justify-between gap-4 border-b border-ink/10 px-6 py-5">
					<div>
						<p class="text-xs font-bold tracking-[0.22em] text-ink/40 uppercase">{eyebrow}</p>
						<h3 id={`${panelId}-title`} class="mt-1 font-display text-3xl font-bold text-ink">
							{title}
						</h3>
					</div>
					<button
						type="button"
						aria-label="Close takeaways"
						class="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-ink/8 hover:text-ink"
						onclick={closePanel}
					>
						<X size={22} aria-hidden="true" />
					</button>
				</div>
				<div bind:this={contentEl} class="flex-1 overflow-y-auto px-6 py-6">
					{#if summary}
						<p
							class="mb-6 border-b border-ink/10 pb-6 text-lg leading-relaxed text-pretty text-ink/78"
						>
							{summary}
						</p>
					{/if}
					{#if items.length}
						<ul class="space-y-5">
							{#each items as item, index (item.text)}
								<li class="grid grid-cols-[auto_1fr] gap-3 text-lg leading-relaxed text-ink/80">
									<span
										class={cn(
											'mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-black',
											accentClass
										)}
										aria-hidden="true"
									>
										{index + 1}
									</span>
									<div>
										<p>{item.text}</p>
										{#if item.href}
											<button
												type="button"
												class={cn(
													'mt-2 inline-flex cursor-pointer text-sm font-bold underline decoration-current/30 underline-offset-4 transition-colors hover:decoration-current',
													linkClass
												)}
												onclick={() => goToTakeaway(item)}
											>
												{item.linkLabel ?? 'Read the section'}
											</button>
										{/if}
									</div>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</div>
		</div>
	{/if}
{/snippet}

{#if hasContent}
	{#if variant === 'top'}
		<section class="bg-cream py-8 text-ink md:py-10" aria-labelledby={titleId}>
			<div class="mx-auto max-w-(--container-wide) px-6 lg:px-8">
				<div
					class="flex flex-col gap-4 border-y border-ink/10 py-5 sm:flex-row sm:items-center sm:justify-between"
				>
					<div>
						<p class="text-xs font-bold tracking-[0.22em] text-ink/40 uppercase">{eyebrow}</p>
						<h2 id={titleId} class="mt-1 font-display text-2xl font-bold text-ink md:text-3xl">
							{title}
						</h2>
					</div>
					<button
						type="button"
						class={cn(
							'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-colors',
							buttonClass
						)}
						aria-expanded={mounted}
						aria-controls={panelId}
						aria-label={buttonAriaLabel}
						onclick={openPanel}
					>
						<PanelLeftOpen size={18} aria-hidden="true" />
						<span>{openLabel}</span>
					</button>
				</div>
			</div>
		</section>

		{@render panel()}
	{:else if variant === 'chapter'}
		<button
			type="button"
			class={cn(
				'inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-black tracking-[0.08em] uppercase transition-colors',
				buttonClass
			)}
			aria-expanded={mounted}
			aria-controls={panelId}
			aria-label={buttonAriaLabel}
			onclick={openPanel}
		>
			<PanelLeftOpen size={15} aria-hidden="true" />
			<span>{openLabel}</span>
		</button>
		{@render panel()}
	{:else}
		<section class="bg-cream py-20 text-ink md:py-28" aria-labelledby={titleId}>
			<div class="mx-auto max-w-(--container-wide) px-6 lg:px-8">
				<div class="grid gap-10 border-y border-ink/10 py-10 lg:grid-cols-12 lg:items-start">
					<div class="lg:col-span-4">
						<p
							class="inline-flex items-center gap-2 text-xs font-bold tracking-[0.22em] text-ink/40 uppercase"
						>
							{eyebrow}
						</p>
						<h2 id={titleId} class="mt-3 font-display text-4xl font-bold text-ink md:text-5xl">
							{title}
						</h2>
					</div>
					<ul class="space-y-5 lg:col-span-8">
						{#each items as item (item.text)}
							<li class="grid grid-cols-[auto_1fr] gap-3 text-xl leading-relaxed text-ink/78">
								<ChevronsRight
									class={cn(
										'mt-1.5 shrink-0',
										accent === 'forest' ? 'text-brand-forest' : 'text-brand-amber-deep'
									)}
									size={22}
									aria-hidden="true"
								/>
								<div>
									<p>{item.text}</p>
									{#if item.href}
										<button
											type="button"
											class={cn(
												'mt-2 inline-flex cursor-pointer text-sm font-bold underline decoration-current/30 underline-offset-4 transition-colors hover:decoration-current',
												linkClass
											)}
											onclick={() => goToTakeaway(item)}
										>
											{item.linkLabel ?? 'Read the section'}
										</button>
									{/if}
								</div>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</section>
	{/if}
{/if}
