<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';
	import { authClient } from '$lib/auth-client';
	import BookOpen from 'lucide-svelte/icons/book-open';
	import Brain from 'lucide-svelte/icons/brain';
	import CheckCircle2 from 'lucide-svelte/icons/check-circle-2';
	import LogOut from 'lucide-svelte/icons/log-out';
	import Sparkles from 'lucide-svelte/icons/sparkles';

	let { data }: PageProps = $props();
	let signingOut = $state(false);

	async function signOut() {
		signingOut = true;
		await authClient.signOut();
		await invalidateAll();
		await goto(resolve('/'));
	}
</script>

<svelte:head>
	<title>Account | Pixel Poetry</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="min-h-[calc(100svh-4rem)] bg-cream px-4 py-12 sm:px-6 lg:px-8">
	<div class="mx-auto max-w-(--container-wide)">
		<div class="flex flex-col gap-6 border-b border-ink/10 pb-8 md:flex-row md:items-end md:justify-between">
			<div>
				<p class="mb-3 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-ink/45">
					<Sparkles size={14} aria-hidden="true" />
					Member space
				</p>
				<h1 class="font-display text-5xl font-black text-ink sm:text-6xl">
					Hi, {data.user.name}.
				</h1>
				<p class="mt-4 max-w-2xl text-lg leading-8 text-ink/60">
					This is the quiet first shelf for logged-in Pixel Poetry features. The useful AI reading tools come next.
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
					Soon: chapter summaries, key takeaways, and generated recap sheets for each explainer.
				</p>
			</article>

			<article class="rounded-lg border border-ink/10 bg-paper p-5">
				<CheckCircle2 class="text-brand-forest" size={26} aria-hidden="true" />
				<h2 class="mt-4 font-display text-2xl font-black text-ink">Saved takeaways</h2>
				<p class="mt-3 text-sm leading-6 text-ink/55">
					Soon: keep the conclusions that matter and return to them without hunting through an essay.
				</p>
			</article>
		</div>
	</div>
</section>
