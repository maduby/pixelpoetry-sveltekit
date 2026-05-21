<script lang="ts">
	/**
	 * /ultra-processed — topic hub.
	 *
	 * The root URL for everything under the Ultra-Processed topic.
	 * Right now it holds one piece of content (the explainer essay).
	 * As more tools and formats ship (scanner, quiz, data explorer…)
	 * they appear here as cards.
	 */
	import { setActiveExplainer } from '$lib/context/explainer.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { absoluteUrl } from '$lib/utils/seo';
	import { reveal } from '$lib/attachments/reveal';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import BookOpen from 'lucide-svelte/icons/book-open';

	setActiveExplainer(null);

	/** Placeholder structure for future content types under this topic */
	const pieces = [
		{
			href: '/ultra-processed/explainer',
			type: 'Scrollytelling essay',
			icon: '📖',
			title: 'The food that isn\'t food',
			description:
				'A chapter-by-chapter investigation into ultra-processed food: what NOVA reveals, how it rewires appetite, and why regulation lags the science.',
			readTimeMin: 12,
			chapterCount: 9,
			status: 'published' as const
		}
		// Future entries e.g.:
		// { href: '/ultra-processed/scanner', type: 'AI tool', icon: '📷', title: 'Label scanner', … }
	];

	const topicJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: 'Ultra-Processed',
		description: 'Everything Pixel Poetry has published on ultra-processed food.',
		url: absoluteUrl('/ultra-processed'),
		mainEntity: {
			'@type': 'ItemList',
			itemListElement: pieces.map((piece, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				name: piece.title,
				url: absoluteUrl(piece.href),
				description: piece.description
			}))
		}
	};
</script>

<SEO
	title="Ultra-Processed"
	description="Everything Pixel Poetry has published on ultra-processed food — essays, tools, and data."
	ogImage="/explainers/ultra-processed/images/share-image--upf.png"
	imageAlt="Pixel Poetry ultra-processed food explainer social preview"
	canonical="/ultra-processed"
	jsonLd={topicJsonLd}
/>

<section class="bg-cream pt-24 pb-16 md:pt-32 md:pb-20">
	<div class="mx-auto max-w-(--container-wide) px-6 lg:px-8">
		<p
			class="font-body text-sm font-bold tracking-[0.25em] text-brand-red uppercase"
			{@attach reveal({ y: 16 })}
		>
			Food & health
		</p>
		<h1
			class="mt-4 max-w-4xl font-display text-5xl font-bold leading-tight tracking-tight text-balance md:text-7xl"
			{@attach reveal({ y: 24, delay: 100 })}
		>
			Ultra-Processed
		</h1>
		<p
			class="mt-6 max-w-2xl text-xl leading-relaxed text-ink/70 md:text-2xl"
			{@attach reveal({ y: 20, delay: 200 })}
		>
			The food that isn't food — and what it's doing to us. Evidence, tools, and interactive
			stories on ultra-processed food.
		</p>
	</div>
</section>

<section class="bg-cream pb-24 md:pb-32">
	<div class="mx-auto max-w-(--container-wide) px-6 lg:px-8">

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
			{#each pieces as piece (piece.href)}
				<a
					href={piece.href}
					class="group flex flex-col overflow-hidden rounded-3xl border border-ink/10 bg-paper transition-all duration-300 hover:-translate-y-1 hover:border-brand-red/40 hover:shadow-2xl hover:shadow-ink/10"
					{@attach reveal({ y: 24 })}
				>
					<!-- Type badge + icon -->
					<div class="flex items-center gap-3 border-b border-ink/8 px-7 py-4">
						<span class="text-2xl" aria-hidden="true">{piece.icon}</span>
						<span class="font-body text-xs font-bold uppercase tracking-[0.18em] text-brand-red/80">
							{piece.type}
						</span>
					</div>

					<div class="flex flex-1 flex-col gap-4 p-7">
						<h2 class="font-display text-2xl font-bold leading-tight tracking-tight text-ink">
							{piece.title}
						</h2>
						<p class="text-base leading-relaxed text-ink/65">{piece.description}</p>

						<div
							class="mt-auto flex items-center justify-between border-t border-ink/8 pt-4 text-xs text-ink/50"
						>
							<span>
								{#if piece.readTimeMin}~{piece.readTimeMin} min read{/if}
								{#if piece.chapterCount} · {piece.chapterCount} chapters{/if}
							</span>
							<span
								class="inline-flex items-center gap-1 font-semibold text-brand-red transition-transform group-hover:translate-x-0.5"
							>
								<BookOpen size={13} aria-hidden="true" />
								Read
								<ArrowRight size={13} aria-hidden="true" />
							</span>
						</div>
					</div>
				</a>
			{/each}

			<!-- "More coming" placeholder card -->
			<div
				class="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-ink/15 px-7 py-12 text-center text-ink/30"
				{@attach reveal({ y: 24, delay: 80 })}
			>
				<span class="text-3xl" aria-hidden="true">🔬</span>
				<p class="text-sm font-semibold">More coming</p>
				<p class="text-xs leading-relaxed">
					A label scanner, a data explorer, a quiz — building when the science is ready.
				</p>
			</div>
		</div>

		<div class="mt-16" {@attach reveal({ y: 16, delay: 100 })}>
			<a
				href="/"
				class="inline-flex items-center gap-2 text-sm font-semibold text-ink/50 transition-colors hover:text-ink"
			>
				← All topics
			</a>
		</div>
	</div>
</section>
