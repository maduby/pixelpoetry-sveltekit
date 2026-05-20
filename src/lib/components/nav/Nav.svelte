<script lang="ts">
	/**
	 * Site nav. Route-aware: when an explainer is active (set in the active
	 * explainer context), shows that essay's logo + chapter list. On the
	 * landing page and other static pages, shows the Pixel Poetry brand +
	 * "Explainers" link.
	 */
	import { site } from '$lib/data/site';
	import { getActiveExplainer } from '$lib/context/explainer.svelte';
	import { cn } from '$lib/utils/cn';
	import Menu from 'lucide-svelte/icons/menu';
	import X from 'lucide-svelte/icons/x';
	import { posthog } from '$lib/analytics/posthog';
	import ShareMenu from '$lib/components/nav/ShareMenu.svelte';

	const explainer = $derived(getActiveExplainer());

	let open = $state(false);

	function close() {
		open = false;
	}
</script>

<header
	class="fixed inset-x-0 top-0 z-50 bg-cream/80 backdrop-blur supports-backdrop-filter:bg-cream/60"
>
	<!--
		Fixed 64px tall — matches `top-16` on <ProgressBar /> so the bar sits
		exactly under, not under or behind, the nav. Mobile menu sits below
		this row inside the same <header>.
	-->
	<div class="mx-auto flex h-16 max-w-(--container-wide) items-center justify-between px-6 lg:px-8">
		{#if explainer}
			<a
				href={explainer.meta.href}
				class="group flex items-baseline gap-2 font-display text-xl font-bold tracking-tight"
				onclick={close}
			>
				<span class="text-brand-red">{explainer.meta.shortName}</span>
				<span class="hidden text-ink/70 sm:inline">
					{#if explainer.meta.emoji}{explainer.meta.emoji}{/if} {explainer.meta.name}
				</span>
			</a>
		{:else}
			<a
				href="/"
				class="group flex items-baseline gap-2 font-display text-xl font-bold tracking-tight"
				onclick={close}
			>
				<span
					style="background: linear-gradient(90deg, #f43f5e 0%, #f97316 25%, #eab308 50%, #22c55e 75%, #3b82f6 100%); -webkit-background-clip: text; background-clip: text; color: transparent;"
				>
					{site.name}
				</span>
			</a>
		{/if}

		<!--
			Desktop right rail. On explainer pages: ShareMenu + Sources CTA.
			On the landing page: a single "Explainers" link.
		-->
		<div class="hidden items-center gap-3 lg:flex">
			{#if explainer}
				<ShareMenu />
				<a
					href="#sources"
					class="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-brand-red"
					onclick={() => posthog.capture('sources_nav_clicked')}
				>
					Sources
				</a>
			{:else}
				<a
					href="/#explainers"
					class="text-sm font-semibold text-ink/70 transition-colors hover:text-brand-red"
				>
					Explainers
				</a>
				<a
					href="/about"
					class="text-sm font-semibold text-ink/70 transition-colors hover:text-brand-red"
				>
					About
				</a>
				<ShareMenu />
			{/if}
		</div>

		<!-- Mobile right: Share + hamburger (only when there's a menu worth opening) -->
		<div class="flex items-center gap-1 lg:hidden">
			<ShareMenu />
			{#if explainer}
				<button
					type="button"
					class="rounded-full p-2 text-ink"
					aria-label={open ? 'Close menu' : 'Open menu'}
					aria-expanded={open}
					aria-controls="mobile-nav"
					onclick={() => {
						if (!open) posthog.capture('mobile_nav_opened');
						open = !open;
					}}
				>
					{#if open}
						<X size={22} aria-hidden="true" />
					{:else}
						<Menu size={22} aria-hidden="true" />
					{/if}
				</button>
			{/if}
		</div>
	</div>

	{#if explainer}
		<nav
			id="mobile-nav"
			aria-label="Mobile"
			class={cn(
				'overflow-hidden border-t border-ink/10 bg-cream shadow-lg shadow-ink/10 transition-[max-height,opacity] duration-300 lg:hidden',
				open ? 'max-h-[80svh] opacity-100' : 'max-h-0 opacity-0'
			)}
		>
			<ul class="space-y-1 px-6 py-4">
				{#each explainer.chapters as chapter (chapter.id)}
					<li>
						<a
							href={`#${chapter.id}`}
							onclick={close}
							class="block py-2 font-display text-lg font-bold text-ink/80 hover:text-brand-red"
						>
							<span class="mr-3 text-sm text-ink/40"
								>{chapter.number.toString().padStart(2, '0')}</span
							>{chapter.shortTitle ?? chapter.title}
						</a>
					</li>
				{/each}
				<li class="pt-2">
					<a
						href="#sources"
						onclick={close}
						class="block py-2 font-body text-sm font-semibold tracking-wider text-ink/60 uppercase"
					>
						Sources & methodology →
					</a>
				</li>
				<li class="pt-2">
					<a
						href="/"
						onclick={close}
						class="block py-2 font-body text-sm font-semibold tracking-wider text-ink/40 uppercase"
					>
						← All explainers
					</a>
				</li>
			</ul>
		</nav>
	{/if}
</header>
