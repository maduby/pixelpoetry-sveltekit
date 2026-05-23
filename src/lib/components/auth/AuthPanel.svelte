<script lang="ts">
	import Sparkles from 'lucide-svelte/icons/sparkles';
	import type { Snippet } from 'svelte';

	interface Props {
		eyebrow: string;
		title: string;
		copy: string;
		children: Snippet;
	}

	let { eyebrow, title, copy, children }: Props = $props();
</script>

<section class="relative min-h-[calc(100svh-4rem)] overflow-hidden bg-cream">
	<div
		class="mx-auto grid min-h-[calc(100svh-4rem)] max-w-(--container-wide) items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,440px)] lg:px-8"
	>
		<div class="max-w-2xl">
			<div class="mb-6 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-ink/45">
				<Sparkles size={14} aria-hidden="true" />
				{eyebrow}
			</div>
			<h1 class="font-display text-5xl font-black leading-[0.98] text-ink sm:text-6xl lg:text-7xl">
				{title}
			</h1>
			<p class="mt-6 max-w-xl text-lg leading-8 text-ink/65 sm:text-xl">
				{copy}
			</p>
			<div class="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
				<div class="border-t-4 border-brand-red bg-paper p-4 shadow-sm">
					<p class="text-sm font-black text-ink">Saved context</p>
					<p class="mt-1 text-sm leading-6 text-ink/55">Reading progress and future study notes.</p>
				</div>
				<div class="border-t-4 border-brand-amber bg-paper p-4 shadow-sm">
					<p class="text-sm font-black text-ink">AI takeaways</p>
					<p class="mt-1 text-sm leading-6 text-ink/55">Summaries tuned to the essay you are in.</p>
				</div>
				<div class="border-t-4 border-brand-forest bg-paper p-4 shadow-sm">
					<p class="text-sm font-black text-ink">Member tools</p>
					<p class="mt-1 text-sm leading-6 text-ink/55">A quiet home for useful additions later.</p>
				</div>
			</div>
		</div>

		<div class="rounded-lg border border-ink/10 bg-paper p-5 shadow-xl shadow-ink/10 sm:p-6">
			{@render children()}
		</div>
	</div>
</section>
