<script lang="ts">
	/**
	 * <NavDrawer> — a left-side drawer using the same native <dialog> pattern
	 * as the bottom <Sheet />. Slides in from the left.
	 *
	 * Contains: site nav (home, explainers, about), per-essay chapter list
	 * when an explainer is active, and footer links.
	 */
	import { page } from '$app/state';
	import { goto, invalidateAll } from '$app/navigation';
	import { site } from '$lib/data/site';
	import { explainers } from '$lib/data/explainers';
	import { getExplainerHolder } from '$lib/context/explainer.svelte';
	import { posthog } from '$lib/analytics/posthog';
	import { authClient } from '$lib/auth-client';
	import X from 'lucide-svelte/icons/x';
	import BookOpen from 'lucide-svelte/icons/book-open';
	import Home from 'lucide-svelte/icons/home';
	import Info from 'lucide-svelte/icons/info';
	import LogIn from 'lucide-svelte/icons/log-in';
	import LogOut from 'lucide-svelte/icons/log-out';
	import UserCircle from 'lucide-svelte/icons/user-circle';

	interface Props {
		open?: boolean;
	}
	type UserSummary = {
		id: string;
		name: string;
		email: string;
		image?: string | null;
	};

	let { open = $bindable(false) }: Props = $props();

	const explainerHolder = getExplainerHolder();
	const explainer = $derived(explainerHolder?.current ?? null);
	const currentPath = $derived(page.url.pathname);
	const user = $derived(page.data.user as UserSummary | null | undefined);

	let dialogEl = $state<HTMLDialogElement | undefined>(undefined);
	let panelEl = $state<HTMLDivElement | undefined>(undefined);
	let isVisible = $state(false);

	let prefersReducedMotion = $derived(
		typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
	);

	$effect(() => {
		if (!dialogEl) return;
		if (open) {
			if (!dialogEl.open) dialogEl.showModal();
			isVisible = true;
			document.body.style.overflow = 'hidden';
			requestAnimationFrame(() => panelEl?.focus());
		} else if (isVisible) {
			isVisible = false;
			const duration = prefersReducedMotion ? 0 : 300;
			setTimeout(() => {
				if (dialogEl?.open) dialogEl.close();
				document.body.style.overflow = '';
			}, duration);
		}
	});

	function close() {
		open = false;
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape') { e.preventDefault(); close(); }
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === dialogEl) close();
	}

	function isActive(href: string) {
		return currentPath === href || (href !== '/' && currentPath.startsWith(href));
	}

	async function signOut() {
		close();
		await authClient.signOut();
		await invalidateAll();
		await goto('/');
	}

	const accentColors: Record<string, string> = {
		red: 'text-brand-red',
		amber: 'text-brand-amber-deep',
		pink: 'text-brand-pink',
		ink: 'text-ink',
		forest: 'text-brand-forest',
		blue: 'text-brand-ocean'
	};
</script>

<dialog
	bind:this={dialogEl}
	onkeydown={handleKeyDown}
	onclick={handleBackdropClick}
	onclose={() => { open = false; }}
	class="nav-drawer backdrop:bg-ink/50 backdrop:backdrop-blur-sm"
	aria-label="Site navigation"
>
	<!-- Left-anchored panel — slides in from the left edge -->
	<div
		bind:this={panelEl}
		tabindex="-1"
		class="absolute inset-y-0 left-0 flex h-full w-[min(360px,90vw)] flex-col bg-cream shadow-2xl outline-none"
		style:transform={isVisible ? 'translateX(0)' : 'translateX(-100%)'}
		class:transition-transform={!prefersReducedMotion}
		class:duration-300={!prefersReducedMotion}
		class:ease-out={!prefersReducedMotion}
	>
		<!-- Header row -->
		<div class="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-ink/10 px-5">
			<a
				href="/"
				onclick={close}
				class="font-display text-lg font-black leading-none"
				style="background: linear-gradient(90deg, #f43f5e 0%, #f97316 25%, #eab308 50%, #22c55e 75%, #3b82f6 100%); -webkit-background-clip: text; background-clip: text; color: transparent;"
			>
				{site.name}
			</a>
			<button
				type="button"
				onclick={close}
				aria-label="Close navigation"
				class="flex min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-full p-2 text-ink/50 transition-colors hover:bg-ink/8 hover:text-ink"
			>
				<X size={20} aria-hidden="true" />
			</button>
		</div>

		<!-- Scrollable body -->
		<div class="flex-1 overflow-y-auto py-4">
			<div class="px-3 pb-4">
				{#if user}
					<a
						href="/account"
						onclick={close}
						class="flex items-center gap-3 rounded-xl border border-ink/10 bg-paper px-3 py-3 transition-colors hover:bg-cream-soft"
					>
						<UserCircle size={22} aria-hidden="true" class="shrink-0 text-brand-red" />
						<span class="min-w-0 flex-1">
							<span class="block truncate text-sm font-black text-ink">{user.name}</span>
							<span class="block truncate text-xs text-ink/45">{user.email}</span>
						</span>
					</a>
					<button
						type="button"
						onclick={signOut}
						class="mt-2 flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink/55 transition-colors hover:bg-ink/5 hover:text-ink"
					>
						<LogOut size={16} aria-hidden="true" class="shrink-0 opacity-60" />
						Sign out
					</button>
				{:else}
					<a
						href="/login"
						onclick={close}
						class="flex items-center gap-3 rounded-xl border border-ink/10 bg-paper px-3 py-3 text-sm font-black text-ink transition-colors hover:bg-cream-soft"
					>
						<LogIn size={18} aria-hidden="true" class="shrink-0 text-brand-red" />
						Log in
					</a>
				{/if}
			</div>

			<!-- Main nav links -->
			<nav aria-label="Site navigation">
				<ul class="px-3">
					<li>
						<a
							href="/"
							onclick={close}
							class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors {isActive('/') && currentPath === '/' ? 'bg-ink/6 text-ink' : 'text-ink/60 hover:bg-ink/5 hover:text-ink'}"
						>
							<Home size={16} aria-hidden="true" class="shrink-0 opacity-60" />
							Home
						</a>
					</li>
					<li>
						<a
							href="/explainers"
							onclick={close}
							class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors {isActive('/explainers') && !explainer ? 'bg-ink/6 text-ink' : 'text-ink/60 hover:bg-ink/5 hover:text-ink'}"
						>
							<BookOpen size={16} aria-hidden="true" class="shrink-0 opacity-60" />
							All explainers
						</a>
					</li>
					<li>
						<a
							href="/about"
							onclick={close}
							class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors {isActive('/about') ? 'bg-ink/6 text-ink' : 'text-ink/60 hover:bg-ink/5 hover:text-ink'}"
						>
							<Info size={16} aria-hidden="true" class="shrink-0 opacity-60" />
							About
						</a>
					</li>
				</ul>
			</nav>

			<!-- Divider -->
			<div class="mx-5 my-4 border-t border-ink/8"></div>

			<!-- Explainer index -->
			<div class="px-3">
				<p class="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-ink/35">
					Explainers
				</p>
				<ul class="space-y-0.5">
					{#each explainers as e (e.slug)}
						{@const accent = accentColors[e.accent] ?? 'text-ink'}
						{@const isPublished = e.status === 'published'}
						<li>
							{#if isPublished}
								<a
									href={e.href}
									data-sveltekit-reload
									onclick={() => { close(); posthog.capture('drawer_explainer_clicked', { slug: e.slug }); }}
									class="group flex flex-col rounded-xl px-3 py-2.5 transition-colors {isActive(e.href) ? 'bg-ink/6' : 'hover:bg-ink/5'}"
								>
									<span class="text-[11px] font-bold uppercase tracking-[0.16em] {accent} opacity-80">
										{e.eyebrow}
									</span>
									<span class="mt-0.5 text-sm font-semibold text-ink/80 group-hover:text-ink">
										{e.title}
									</span>
									{#if e.readTimeMin}
										<span class="mt-0.5 text-[11px] text-ink/40">~{e.readTimeMin} min read</span>
									{/if}
								</a>
							{:else}
								<div class="flex flex-col rounded-xl px-3 py-2.5 opacity-50">
									<span class="text-[11px] font-bold uppercase tracking-[0.16em] {accent}">
										{e.eyebrow}
									</span>
									<span class="mt-0.5 text-sm font-semibold text-ink/60">{e.title}</span>
									<span class="mt-0.5 text-[11px] text-ink/40 capitalize">{e.status === 'in-progress' ? 'In progress' : 'Coming soon'}</span>
								</div>
							{/if}
						</li>
					{/each}
				</ul>
			</div>

			<!-- Chapter list (only when on an explainer page) -->
			{#if explainer}
				<div class="mx-5 my-4 border-t border-ink/8"></div>
				<div class="px-3">
					<p class="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-ink/35">
						{explainer.meta.shortName} — Chapters
					</p>
					<ul class="space-y-0.5">
						{#each explainer.chapters as chapter (chapter.id)}
							<li>
								<a
									href={`#${chapter.id}`}
									onclick={close}
									class="group flex items-baseline gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-ink/5"
								>
									<span class="w-5 shrink-0 text-right text-[11px] font-bold tabular-nums text-ink/30">
										{chapter.number.toString().padStart(2, '0')}
									</span>
									{#if chapter.emoji}
										<span aria-hidden="true" class="shrink-0 text-base leading-none">{chapter.emoji}</span>
									{/if}
									<span class="font-semibold text-ink/70 group-hover:text-ink">
										{chapter.shortTitle ?? chapter.title}
									</span>
								</a>
							</li>
						{/each}
						<li class="pt-1">
							<a
								href="#sources"
								onclick={close}
								class="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink/70"
							>
								Sources & methodology →
							</a>
						</li>
						<li class="pt-1">
							<a
								href={explainer.meta.topicHref ?? '/'}
								onclick={close}
								class="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-ink/35 transition-colors hover:bg-ink/5 hover:text-ink/60"
							>
								← {explainer.meta.name} topic hub
							</a>
						</li>
					</ul>
				</div>
			{/if}
		</div>

		<!-- Footer links inside drawer -->
		<div class="shrink-0 border-t border-ink/8 px-5 py-4">
			<div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink/40">
				<a href="https://duby.io" target="_blank" rel="noopener noreferrer" class="transition-colors hover:text-ink/70">duby.io</a>
				<a href="https://github.com/maduby/pixelpoetry-sveltekit" target="_blank" rel="noopener noreferrer" class="transition-colors hover:text-ink/70">GitHub</a>
				<a href="mailto:hello@pixelpoetry.dev" class="transition-colors hover:text-ink/70">hello@pixelpoetry.dev</a>
			</div>
			<p class="mt-2 text-[11px] text-ink/30">© {new Date().getFullYear()} {site.name}</p>
		</div>
	</div>
</dialog>

<style>
	.nav-drawer {
		position: fixed;
		inset: 0;
		width: 100%;
		height: 100%;
		max-width: none;
		max-height: none;
		margin: 0;
		padding: 0;
		background: transparent;
		border: none;
		overflow: hidden;
	}
	.nav-drawer:not([open]) { display: none; }
	.nav-drawer[open] { display: block; }
</style>
