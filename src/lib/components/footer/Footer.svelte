<script lang="ts">
	/**
	 * Global site footer — always visible. Keeps the byline, brand mark and
	 * copyright on every page (landing, about, explainers).
	 *
	 * Heavy explainer-specific sections (sources & methodology, image credits,
	 * chapter nav) live in `<EssayFooter />`, which each explainer page renders
	 * directly above this footer.
	 */
	import { site } from '$lib/data/site';
</script>

<footer class="bg-ink text-cream">
	<div class="mx-auto max-w-(--container-wide) px-6 py-16 lg:px-8 lg:py-20">
		<div class="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
			<!-- Byline -->
			<div>
				<p class="mb-1 text-xs font-bold tracking-[0.18em] text-cream/30 uppercase">A project by</p>
				<a
					href={site.url}
					class="block font-display text-3xl font-black leading-tight"
					style="background: linear-gradient(90deg, #f43f5e 0%, #f97316 20%, #eab308 40%, #22c55e 60%, #3b82f6 80%, #a855f7 100%); -webkit-background-clip: text; background-clip: text; color: transparent;"
				>
					{site.name}
				</a>
				<p class="mt-2 max-w-md text-sm text-cream/40">
					{site.tagline}
				</p>
				<p class="mt-2 text-sm text-cream/40">
					Made by
					<a
						href="https://duby.io"
						target="_blank"
						rel="noopener noreferrer"
						class="text-cream/60 underline decoration-dotted underline-offset-2 transition-colors hover:text-brand-amber"
						>Marc Duby</a
					>
				</p>
			</div>

			<!-- Quick links -->
			<nav aria-label="Footer" class="flex flex-col gap-2 md:items-end">
				<a
					href="/#explainers"
					class="text-sm font-semibold text-cream/70 transition-colors hover:text-brand-amber"
				>
					Explainers
				</a>
				<a
					href="/about"
					class="text-sm font-semibold text-cream/70 transition-colors hover:text-brand-amber"
				>
					About
				</a>
				<a
					href="https://github.com/maduby/pixelpoetry-sveltekit"
					target="_blank"
					rel="noopener noreferrer"
					class="text-sm font-semibold text-cream/70 transition-colors hover:text-brand-amber"
				>
					GitHub
				</a>
			</nav>
		</div>

		<div
			class="mt-10 flex flex-col gap-1 border-t border-cream/10 pt-6 text-xs text-cream/30 md:flex-row md:items-center md:justify-between"
		>
			<p>© {new Date().getFullYear()} {site.name}. Editorial project. Not medical advice.</p>
			<p>All quoted statistics cite peer-reviewed literature.</p>
		</div>
	</div>
</footer>
