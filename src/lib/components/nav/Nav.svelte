<script lang="ts">
	/**
	 * Site nav. Route-aware: when an explainer is active, shows that essay's
	 * logo + chapter-aware right rail. On the landing page shows the Pixel
	 * Poetry brand + top-level links.
	 *
	 * The hamburger on the far left opens <NavDrawer /> on every page and
	 * every screen size — it replaces the old inline mobile dropdown.
	 */
	import { site } from '$lib/data/site';
	import { getActiveExplainer } from '$lib/context/explainer.svelte';
	import { getTheme } from '$lib/utils/explainer-theme';
	import { posthog } from '$lib/analytics/posthog';
	import Menu from 'lucide-svelte/icons/menu';
	import ShareMenu from '$lib/components/nav/ShareMenu.svelte';
	import NavDrawer from '$lib/components/nav/NavDrawer.svelte';

	const explainer = $derived(getActiveExplainer());
	const theme = $derived(getTheme(explainer?.meta.accent));

	let drawerOpen = $state(false);

	function openDrawer() {
		posthog.capture('nav_drawer_opened', { page: explainer?.meta.slug ?? 'landing' });
		drawerOpen = true;
	}
</script>

<NavDrawer bind:open={drawerOpen} />

<style>
	@keyframes rainbow-flow {
		0%   { background-position: 0% 50%; }
		100% { background-position: 200% 50%; }
	}

	.logo-rainbow {
		/* Wide gradient so the shift is gradual and smooth */
		background: linear-gradient(
			90deg,
			#f43f5e  0%,
			#f97316 14%,
			#eab308 28%,
			#22c55e 42%,
			#3b82f6 56%,
			#a855f7 70%,
			#f43f5e 84%,
			#f97316 100%
		);
		background-size: 200% auto;
		background-clip: text;
		-webkit-background-clip: text;
		color: transparent;
		animation: rainbow-flow 20s linear infinite;
	}
</style>

<header
	class="fixed inset-x-0 top-0 z-50 bg-cream/80 backdrop-blur supports-backdrop-filter:bg-cream/60"
>
	<div class="mx-auto flex h-16 max-w-(--container-wide) items-center gap-3 px-4 lg:px-8">

		<!-- Hamburger — always on the far left -->
		<button
			type="button"
			onclick={openDrawer}
			aria-label="Open navigation"
			aria-haspopup="dialog"
			class="flex min-h-10 min-w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-ink/8 hover:text-ink"
		>
			<Menu size={22} aria-hidden="true" />
		</button>

		<!-- Logo / essay name — centred between hamburger and right rail -->
		<div class="flex flex-1 items-center justify-center lg:justify-start">
			{#if explainer}
			<a
				href={explainer.meta.href}
				class="flex items-baseline gap-2 font-display text-xl font-bold tracking-tight"
			>
				<span class={theme.badgeText}>{explainer.meta.shortName}</span>
					<span class="hidden text-ink/70 sm:inline">
						{#if explainer.meta.emoji}<span aria-hidden="true">{explainer.meta.emoji}</span>{/if}
						{explainer.meta.name}
					</span>
				</a>
			{:else}
			<a
				href="/"
				class="flex items-baseline gap-2 font-display text-xl font-bold tracking-tight"
			>
				<span class="logo-rainbow">
					{site.name}
				</span>
			</a>
			{/if}
		</div>

		<!-- Right rail -->
		<div class="flex shrink-0 items-center gap-2">
			{#if explainer}
				<!-- Essay pages: Share + Sources pill -->
				<ShareMenu />
				<a
					href="#sources"
					class="hidden rounded-full bg-ink px-4 py-2 text-sm font-semibold text-cream transition-colors sm:block {theme.sourcesHover}"
					onclick={() => posthog.capture('sources_nav_clicked')}
				>
					Sources
				</a>
			{:else}
				<!-- Landing / static pages: top-level links -->
				<nav class="hidden items-center gap-1 lg:flex" aria-label="Top navigation">
					<a
						href="/#explainers"
						class="rounded-full px-3 py-2 text-sm font-semibold text-ink/60 transition-colors hover:bg-ink/8 hover:text-ink"
					>
						Explainers
					</a>
					<a
						href="/about"
						class="rounded-full px-3 py-2 text-sm font-semibold text-ink/60 transition-colors hover:bg-ink/8 hover:text-ink"
					>
						About
					</a>
				</nav>
				<ShareMenu />
			{/if}
		</div>

	</div>
</header>
