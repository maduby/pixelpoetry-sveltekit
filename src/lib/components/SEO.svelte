<script lang="ts">
	/**
	 * Per-page SEO head tags. Reads the active explainer from context to
	 * automatically pick up essay-specific title, description, keywords and
	 * og image. Each prop is an explicit override that wins over both the
	 * active explainer and the site defaults.
	 *
	 * Render this component from inside each route's `+page.svelte` — not
	 * the layout — so the active-explainer context is set before SEO renders.
	 */
	import { page } from '$app/state';
	import { site } from '$lib/data/site';
	import { getActiveExplainer } from '$lib/context/explainer.svelte';

	interface Props {
		title?: string;
		description?: string;
		ogImage?: string;
		canonical?: string;
		type?: 'website' | 'article';
		keywords?: string;
	}

	let { title, description, ogImage, canonical, type, keywords }: Props = $props();

	const explainer = $derived(getActiveExplainer());

	const resolvedTitle = $derived(title ?? explainer?.meta.name);
	const resolvedDescription = $derived(
		description ?? explainer?.meta.description ?? site.description
	);
	const resolvedKeywords = $derived(keywords ?? explainer?.meta.keywords ?? site.keywords);
	const resolvedOgImage = $derived(ogImage ?? explainer?.meta.ogImage ?? site.ogImage);
	const resolvedType = $derived(type ?? (explainer ? 'article' : 'website'));

	const canonicalUrl = $derived(canonical ?? `${site.url}${page.url.pathname}`);

	const fullTitle = $derived(
		resolvedTitle ? `${resolvedTitle} — ${site.name}` : `${site.name} — ${site.tagline}`
	);
	// Always use the canonical site.url for OG image so the absolute URL is
	// correct in prerendered HTML (url.origin is 'http://sveltekit-prerender' at build time).
	const ogImageUrl = $derived(`${site.url}${resolvedOgImage}`);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={resolvedDescription} />
	<meta name="keywords" content={resolvedKeywords} />
	<meta name="author" content={site.author} />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href={canonicalUrl} />

	<!-- Open Graph -->
	<meta property="og:type" content={resolvedType} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={resolvedDescription} />
	<meta property="og:image" content={ogImageUrl} />
	<meta property="og:image:type" content="image/jpeg" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={fullTitle} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:locale" content={site.locale} />
	<meta property="og:site_name" content={site.name} />

	<!-- Twitter / X -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={resolvedDescription} />
	<meta name="twitter:image" content={ogImageUrl} />
	{#if site.twitter}
		<meta name="twitter:site" content={site.twitter} />
		<meta name="twitter:creator" content={site.twitter} />
	{/if}

	<meta name="theme-color" content="#fef9ef" />
</svelte:head>
