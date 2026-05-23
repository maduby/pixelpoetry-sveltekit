<script lang="ts">
	import '$lib/styles/app.css';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import Nav from '$lib/components/nav/Nav.svelte';
	import ProgressBar from '$lib/components/nav/ProgressBar.svelte';
	import ResumeReadingToast from '$lib/components/nav/ResumeReadingToast.svelte';
	import Footer from '$lib/components/footer/Footer.svelte';
	import SourceSheet from '$lib/components/ui/SourceSheet.svelte';
	import SavedInsightLayer from '$lib/components/insights/SavedInsightLayer.svelte';
	import { Toaster } from 'svelte-sonner';
	import { initPostHog, capturePageView } from '$lib/analytics/posthog';
	import { provideExplainerHolder, type ActiveExplainer } from '$lib/context/explainer.svelte';
	import { longevity } from '$lib/explainers/longevity';
	import { ultraProcessed } from '$lib/explainers/ultra-processed';

	let { children } = $props();

	// Provide a single explainer holder for the whole app. Each explainer
	// route is resolved here so layout-level components (Nav, ProgressBar,
	// SourceSheet) are correct on direct loads and story-to-story navigation.
	const explainerHolder = provideExplainerHolder();

	function resolveExplainer(pathname: string): ActiveExplainer | null {
		if (pathname === longevity.meta.href || pathname.startsWith(`${longevity.meta.href}/`)) {
			return longevity;
		}
		if (
			pathname === ultraProcessed.meta.href ||
			pathname.startsWith(`${ultraProcessed.meta.href}/`)
		) {
			return ultraProcessed;
		}
		return null;
	}

	explainerHolder.current = resolveExplainer(page.url.pathname);
	const activeExplainer = $derived(resolveExplainer(page.url.pathname));

	$effect(() => {
		explainerHolder.current = activeExplainer;
	});

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
<ResumeReadingToast />

<main id="main-content" class="overflow-x-clip pt-16">
	{@render children()}
</main>

<Footer />

<SourceSheet />
<SavedInsightLayer />
<Toaster position="top-center" offset="5rem" visibleToasts={1} />

<style>
	:global([data-sonner-toaster][data-x-position='center']) {
		left: 50% !important;
		right: auto !important;
		display: flex !important;
		width: min(28rem, calc(100vw - 2rem)) !important;
		max-width: calc(100vw - 2rem) !important;
		flex-direction: column !important;
		align-items: center !important;
		transform: translateX(-50%) !important;
	}

	:global([data-sonner-toaster][data-x-position='center'] [data-sonner-toast]) {
		left: auto !important;
		right: auto !important;
		width: fit-content !important;
		max-width: 100% !important;
		margin-inline: auto !important;
		transform: none !important;
	}
</style>
