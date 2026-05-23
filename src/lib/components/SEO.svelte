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
	import { getExplainerHolder } from '$lib/context/explainer.svelte';
	import {
		absoluteAssetUrl,
		absoluteUrl,
		breadcrumbJsonLd,
		dateOnlyFromDisplayDate,
		normalizePath
	} from '$lib/utils/seo';

	type JsonLd = Record<string, unknown>;

	interface Props {
		title?: string;
		description?: string;
		ogImage?: string;
		imageAlt?: string;
		canonical?: string;
		type?: 'website' | 'article';
		keywords?: string;
		noindex?: boolean;
		publishedTime?: string;
		modifiedTime?: string;
		jsonLd?: JsonLd | JsonLd[];
	}

	let {
		title,
		description,
		ogImage,
		imageAlt,
		canonical,
		type,
		keywords,
		noindex = false,
		publishedTime,
		modifiedTime,
		jsonLd
	}: Props = $props();

	const explainerHolder = getExplainerHolder();
	const explainer = $derived(explainerHolder?.current ?? null);

	const resolvedTitle = $derived(title ?? explainer?.meta.name);
	const resolvedDescription = $derived(
		description ?? explainer?.meta.description ?? site.description
	);
	const resolvedKeywords = $derived(keywords ?? explainer?.meta.keywords ?? site.keywords);
	const resolvedOgImage = $derived(ogImage ?? explainer?.meta.ogImage ?? site.ogImage);
	const resolvedType = $derived(type ?? (explainer ? 'article' : 'website'));
	const resolvedPublishedTime = $derived(publishedTime ?? explainer?.meta.publishedAt);
	const resolvedModifiedTime = $derived(
		modifiedTime ??
			dateOnlyFromDisplayDate(explainer?.meta.editorial?.lastUpdated) ??
			explainer?.meta.publishedAt
	);

	const canonicalPath = $derived(normalizePath(canonical ?? explainer?.meta.href ?? page.url.pathname));
	const canonicalUrl = $derived(absoluteUrl(canonicalPath));

	const fullTitle = $derived(
		resolvedTitle ? `${resolvedTitle} — ${site.name}` : `${site.name} — ${site.tagline}`
	);
	// Always use the canonical site.url for OG image so the absolute URL is
	// correct in prerendered HTML (url.origin is 'http://sveltekit-prerender' at build time).
	const ogImageUrl = $derived(absoluteAssetUrl(resolvedOgImage));
	const resolvedImageAlt = $derived(imageAlt ?? fullTitle);
	const ogImageType = $derived(
		resolvedOgImage.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
	);
	const scriptTag = 'script';

	const baseJsonLd = $derived.by(() => {
		const common = {
			'@context': 'https://schema.org',
			'@id': `${canonicalUrl}#webpage`,
			url: canonicalUrl,
			name: fullTitle,
			description: resolvedDescription,
			isAccessibleForFree: true,
			inLanguage: site.locale,
			publisher: {
				'@type': 'Organization',
				name: site.name,
				url: site.url
			}
		};

		if (resolvedType === 'article') {
			return {
				...common,
				'@type': 'Article',
				headline: resolvedTitle ?? fullTitle,
				image: [ogImageUrl],
				author: {
					'@type': 'Person',
					name: 'Marc Duby',
					url: 'https://duby.io'
				},
				datePublished: resolvedPublishedTime,
				dateModified: resolvedModifiedTime,
				mainEntityOfPage: canonicalUrl,
				keywords: resolvedKeywords
			};
		}

		return {
			...common,
			'@type': 'WebPage',
			image: ogImageUrl
		};
	});

	const siteJsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'@id': `${site.url}/#website`,
		name: site.name,
		url: site.url,
		description: site.description,
		publisher: {
			'@type': 'Organization',
			name: site.name,
			url: site.url
		}
	});

	const schemaScripts = $derived.by(() => {
		const extra = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
		return [siteJsonLd, baseJsonLd, breadcrumbJsonLd(canonicalPath), ...extra].map((schema) =>
			JSON.stringify(schema).replace(/</g, '\\u003c')
		);
	});
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={resolvedDescription} />
	<meta name="keywords" content={resolvedKeywords} />
	<meta name="author" content={site.author} />
	<meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
	<link rel="canonical" href={canonicalUrl} />

	<!-- Open Graph -->
	<meta property="og:type" content={resolvedType} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={resolvedDescription} />
	<meta property="og:image" content={ogImageUrl} />
	<meta property="og:image:secure_url" content={ogImageUrl} />
	<meta property="og:image:type" content={ogImageType} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={resolvedImageAlt} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:locale" content={site.locale} />
	<meta property="og:site_name" content={site.name} />
	{#if resolvedPublishedTime}
		<meta property="article:published_time" content={resolvedPublishedTime} />
	{/if}
	{#if resolvedModifiedTime}
		<meta property="article:modified_time" content={resolvedModifiedTime} />
	{/if}

	<!-- Twitter / X -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={resolvedDescription} />
	<meta name="twitter:image" content={ogImageUrl} />
	<meta name="twitter:image:alt" content={resolvedImageAlt} />
	{#if site.twitter}
		<meta name="twitter:site" content={site.twitter} />
		<meta name="twitter:creator" content={site.twitter} />
	{/if}

	<meta name="theme-color" content="#fef9ef" />
	{#each schemaScripts as schema, i (`schema-${i}`)}
		<svelte:element this={scriptTag} type="application/ld+json">{schema}</svelte:element>
	{/each}
</svelte:head>
