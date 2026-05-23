<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import AuthPanel from '$lib/components/auth/AuthPanel.svelte';
	import { authClient } from '$lib/auth-client';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import BadgeCheck from 'lucide-svelte/icons/badge-check';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';

	let email = $state('');
	let password = $state('');
	let rememberMe = $state(true);
	let errorMessage = $state('');
	let loading = $state(false);
	let googleLoading = $state(false);

	function getRedirectTo(): '/' | '/account' {
		return page.url.searchParams.get('redirectTo') === '/' ? '/' : '/account';
	}

	const redirectTo = $derived(getRedirectTo());

	async function submit() {
		errorMessage = '';
		loading = true;

		const { error } = await authClient.signIn.email({
			email,
			password,
			rememberMe,
			callbackURL: redirectTo
		});

		loading = false;

		if (error) {
			errorMessage = error.message || 'Could not sign you in. Check your details and try again.';
			return;
		}

		await invalidateAll();
		await goto(resolve(redirectTo));
	}

	async function signInWithGoogle() {
		errorMessage = '';
		googleLoading = true;
		const { error } = await authClient.signIn.social({
			provider: 'google',
			callbackURL: redirectTo,
			errorCallbackURL: '/login'
		});
		googleLoading = false;

		if (error) {
			errorMessage = error.message || 'Google sign-in is not configured yet.';
		}
	}
</script>

<svelte:head>
	<title>Log in | Pixel Poetry</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<AuthPanel
	eyebrow="Member access"
	title="Welcome back to the reading room."
	copy="Log in to unlock the first layer of saved benefits, with AI summaries and key takeaways next on the bench."
>
	<div class="mb-6">
		<h2 class="font-display text-3xl font-black text-ink">Log in</h2>
		<p class="mt-2 text-sm leading-6 text-ink/55">
			Use your email or continue with Google.
		</p>
	</div>

	<button
		type="button"
		onclick={signInWithGoogle}
		disabled={googleLoading || loading}
		class="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-ink/15 bg-cream px-4 text-sm font-black text-ink transition-colors hover:bg-cream-soft disabled:cursor-not-allowed disabled:opacity-60"
	>
		{#if googleLoading}
			<LoaderCircle size={18} class="animate-spin" aria-hidden="true" />
		{:else}
			<BadgeCheck size={18} aria-hidden="true" />
		{/if}
		Continue with Google
	</button>

	<div class="my-5 flex items-center gap-3 text-xs font-black uppercase tracking-[0.16em] text-ink/35">
		<span class="h-px flex-1 bg-ink/10"></span>
		or
		<span class="h-px flex-1 bg-ink/10"></span>
	</div>

	<form class="space-y-4" onsubmit={(event) => { event.preventDefault(); submit(); }}>
		<label class="block">
			<span class="text-sm font-black text-ink/70">Email</span>
			<input
				bind:value={email}
				type="email"
				autocomplete="email"
				required
				class="mt-2 min-h-12 w-full rounded-md border-ink/15 bg-cream text-ink placeholder:text-ink/30 focus:border-brand-red focus:ring-brand-red"
				placeholder="you@example.com"
			/>
		</label>

		<label class="block">
			<span class="text-sm font-black text-ink/70">Password</span>
			<input
				bind:value={password}
				type="password"
				autocomplete="current-password"
				required
				minlength="8"
				class="mt-2 min-h-12 w-full rounded-md border-ink/15 bg-cream text-ink placeholder:text-ink/30 focus:border-brand-red focus:ring-brand-red"
				placeholder="At least 8 characters"
			/>
		</label>

		<label class="flex items-center gap-3 text-sm font-semibold text-ink/60">
			<input
				bind:checked={rememberMe}
				type="checkbox"
				class="rounded border-ink/20 text-brand-red focus:ring-brand-red"
			/>
			Keep me logged in
		</label>

		{#if errorMessage}
			<p class="rounded-md border border-brand-red/25 bg-brand-red/8 px-3 py-2 text-sm font-semibold text-brand-red-deep">
				{errorMessage}
			</p>
		{/if}

		<button
			type="submit"
			disabled={loading || googleLoading}
			class="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-black text-cream transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-60"
		>
			{#if loading}
				<LoaderCircle size={18} class="animate-spin" aria-hidden="true" />
				Logging in
			{:else}
				Log in
				<ArrowRight size={18} aria-hidden="true" />
			{/if}
		</button>
	</form>

	<p class="mt-5 text-center text-sm text-ink/55">
		New here?
		<a class="font-black text-ink underline decoration-brand-amber decoration-2 underline-offset-4" href={resolve(`/signup?redirectTo=${encodeURIComponent(redirectTo)}`)}>Create an account</a>
	</p>
</AuthPanel>
