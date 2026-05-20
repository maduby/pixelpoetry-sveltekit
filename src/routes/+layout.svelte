<script lang="ts">
	import '$lib/styles/app.css';
	import { afterNavigate } from '$app/navigation';
	import Nav from '$lib/components/nav/Nav.svelte';
	import ProgressBar from '$lib/components/nav/ProgressBar.svelte';
	import Footer from '$lib/components/footer/Footer.svelte';
	import SourceSheet from '$lib/components/ui/SourceSheet.svelte';
	import { initPostHog, capturePageView } from '$lib/analytics/posthog';
	import { provideExplainerHolder } from '$lib/context/explainer.svelte';

	let { children } = $props();

	// Provide a single explainer holder for the whole app. Each explainer
	// route's `+page.svelte` updates it; static pages reset it to null.
	provideExplainerHolder();

	// Initialise once on first mount, then capture a pageview after every navigation.
	initPostHog();
	afterNavigate(() => capturePageView());
</script>

<svelte:head>
	<!-- Favicon suite (placeholder set inherited from UPF — pixel poetry branded suite TBD) -->
	<link rel="icon" type="image/x-icon" href="/favicon.ico" />
	<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
	<link rel="manifest" href="/site.webmanifest" />
</svelte:head>

<Nav />
<ProgressBar />

<main id="main-content" class="overflow-x-clip pt-16">
	{@render children()}
</main>

<Footer />

<SourceSheet />
