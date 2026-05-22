<script lang="ts">
	/**
	 * <BlueZonesMap> — a minimalist world map with the five Blue Zones
	 * plotted as sized bubbles. Uses D3 geo with the natural earth projection
	 * and a simplified land outline for fast rendering.
	 */
	import { browser } from '$app/environment';
	import { getExplainerHolder } from '$lib/context/explainer.svelte';
	import { openSourceSheet } from '$lib/context/sheet';
	import { CHART_W, CHART_H } from '../chart-constants';

	const BLUE_ZONES = [
		{ name: 'Okinawa, Japan', lat: 26.5, lon: 127.9, value: 41, labelDx: 0, labelDy: 18 },
		{
			name: 'Sardinia, Italy',
			lat: 40.0,
			lon: 9.0,
			value: 22,
			markerDx: -18,
			labelDx: -18,
			labelDy: 19
		},
		{ name: 'Loma Linda, USA', lat: 34.0, lon: -117.3, value: 20, labelDx: 0, labelDy: 18 },
		{ name: 'Nicoya, Costa Rica', lat: 10.1, lon: -85.4, value: 18, labelDx: 0, labelDy: 18 },
		{
			name: 'Ikaria, Greece',
			lat: 37.5,
			lon: 26.0,
			value: 15,
			markerDx: 18,
			labelDx: 18,
			labelDy: 17
		}
	];

	const TITLE = 'Where the centenarians live';
	const CAPTION =
		'Bubble values show approximate centenarians per 100,000 people in the five Blue Zones.';
	const SOURCE_ID = 'buettner-2023';

	const LAND = '#7fb3d5';
	const LAND_STROKE = '#3f759c';
	const BUBBLE = '#00395f';
	const BUBBLE_HALO = '#2f7fb5';
	const LABEL = '#061926';

	const explainerHolder = getExplainerHolder();
	const explainer = $derived(explainerHolder?.current ?? null);
	const source = $derived(explainer?.getSource(SOURCE_ID));

	let containerEl = $state<HTMLDivElement | undefined>(undefined);
	let loaded = $state(false);
	let geoJson = $state<GeoJSON.FeatureCollection | null>(null);
	let d3 = $state<typeof import('d3') | null>(null);
	let pathGen = $state<import('d3').GeoPath | null>(null);
	let projection = $state<import('d3').GeoProjection | null>(null);
	let rScale = $state<d3.ScaleLinear<number, number> | null>(null);

	$effect(() => {
		if (!browser || !containerEl) return;

		let cancelled = false;

		(async () => {
			try {
				const [topoData, topoClient, d3Module] = await Promise.all([
					fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then((r) =>
						r.json()
					),
					import('topojson-client'),
					import('d3')
				]);
				if (cancelled) return;

				d3 = d3Module;
				const feature = topoClient.feature as (
					topo: unknown,
					obj: unknown
				) => GeoJSON.FeatureCollection;
				geoJson = feature(topoData, topoData.objects['countries']);

				const proj = d3.geoNaturalEarth1().fitExtent(
					[
						[16, 8],
						[CHART_W - 16, CHART_H - 24]
					],
					geoJson!
				);
				projection = proj;
				pathGen = d3.geoPath(proj);
				rScale = d3.scaleSqrt().domain([0, 50]).range([18, 46]);
				loaded = true;
			} catch (e) {
				console.error('BlueZonesMap: failed to load geo data', e);
			}
		})();

		return () => {
			cancelled = true;
		};
	});
</script>

<div bind:this={containerEl} class="flex w-full max-w-full min-w-0 flex-col items-start gap-3">
	<p class="font-display text-lg leading-tight font-bold text-ink md:text-xl">{TITLE}</p>

	{#if loaded && geoJson && d3 && pathGen && projection && rScale}
		<svg
			viewBox="0 0 {CHART_W} {CHART_H}"
			role="img"
			aria-label="{TITLE}: world map showing approximate centenarians per 100,000 people in five Blue Zone locations"
			class="w-full overflow-visible"
			style="max-height: 420px"
		>
			<!-- Countries -->
			{#each geoJson.features as feature}
				<path d={pathGen(feature)} fill={LAND} stroke={LAND_STROKE} stroke-width="0.55" />
			{/each}

			<!-- Blue Zone bubbles -->
			{#each BLUE_ZONES as bz}
				{@const coords = projection([bz.lon, bz.lat])}
				{#if coords}
					{@const cx = coords[0] + (bz.markerDx ?? 0)}
					{@const cy = coords[1]}
					{@const r = rScale(bz.value)}

					<!-- Soft outer glow -->
					<circle {cx} {cy} r={r + 7} fill={BUBBLE_HALO} opacity="0.24" />
					<!-- Main bubble -->
					<circle {cx} {cy} {r} fill={BUBBLE} opacity="0.94" />
					<!-- Value label -->
					<text
						x={cx}
						y={cy + 1}
						text-anchor="middle"
						dominant-baseline="middle"
						fill="white"
						font-size="13"
						font-weight="800">{bz.value}</text
					>
					<!-- Place name -->
					<text
						x={cx + bz.labelDx}
						y={cy + r + bz.labelDy}
						text-anchor="middle"
						fill={LABEL}
						font-size="11"
						font-weight="800">{bz.name.split(',')[0]}</text
					>
				{/if}
			{/each}
		</svg>
	{:else}
		<div class="flex items-center justify-center" style="height: 420px">
			<p class="text-sm text-ink/40">Loading map…</p>
		</div>
	{/if}

	<p class="font-body text-xs text-ink/50">{CAPTION}</p>

	{#if source}
		<button
			type="button"
			onclick={() => openSourceSheet(source.id)}
			class="group flex w-fit cursor-pointer items-center gap-1 text-sm font-semibold text-ink/40 transition-colors hover:text-brand-red"
		>
			<span>Source</span>
			<svg
				aria-hidden="true"
				class="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
				viewBox="0 0 12 12"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M2 10 L10 2 M4 2 H10 V8" />
			</svg>
		</button>
	{/if}
</div>
