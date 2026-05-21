/**
 * Creates the "Pixel Poetry — Master Analytics" dashboard in PostHog.
 *
 * Uses the current InsightVizNode query API (not deprecated legacy filters).
 * Covers every tracked event across both explainers:
 *   – Site-wide overview & acquisition funnel
 *   – Cross-explainer comparison
 *   – Per-explainer reader funnels (longevity 10 ch / ultra-processed 9 ch)
 *   – Chapter & step-level engagement
 *   – Navigation, source interactions, share signals
 *
 * Prerequisites:
 *   1. Add POSTHOG_PERSONAL_API_KEY to .env.local
 *      Get it: https://eu.posthog.com/settings/user-api-keys
 *   2. Run: node scripts/create-posthog-dashboard.mjs
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));

// ── Load env ──────────────────────────────────────────────────────────────────
function loadEnv() {
	const envPath = resolve(__dir, '../.env.local');
	try {
		const raw = readFileSync(envPath, 'utf8');
		return Object.fromEntries(
			raw
				.split('\n')
				.filter((l) => l.trim() && !l.startsWith('#'))
				.map((l) => {
					const idx = l.indexOf('=');
					return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
				})
		);
	} catch {
		return {};
	}
}

const env = loadEnv();
const PERSONAL_KEY = env.POSTHOG_PERSONAL_API_KEY || process.env.POSTHOG_PERSONAL_API_KEY;
const HOST = (env.PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com')
	.replace('eu.i.posthog.com', 'eu.posthog.com')
	.replace('us.i.posthog.com', 'us.posthog.com');

if (!PERSONAL_KEY || PERSONAL_KEY.startsWith('phx_REPLACE')) {
	console.error(
		'\n❌  POSTHOG_PERSONAL_API_KEY is not set.\n' +
			'   Add it to .env.local — get yours at:\n' +
			`   ${HOST}/settings/user-api-keys\n`
	);
	process.exit(1);
}

const API = `${HOST}/api`;
const headers = {
	Authorization: `Bearer ${PERSONAL_KEY}`,
	'Content-Type': 'application/json'
};

// ── Helpers ───────────────────────────────────────────────────────────────────
async function req(method, path, body) {
	const res = await fetch(`${API}${path}`, {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`${method} ${path} → ${res.status}: ${text}`);
	}
	return res.json();
}

async function getProjectId() {
	const data = await req('GET', '/projects/');
	const results = data.results ?? data;
	if (!results.length) throw new Error('No PostHog projects found for this API key.');
	const project = results[0];
	console.log(`📦  Project: "${project.name}" (id ${project.id})`);
	return project.id;
}

async function createDashboard(projectId, name, description) {
	const d = await req('POST', `/projects/${projectId}/dashboards/`, {
		name,
		description,
		pinned: true
	});
	console.log(`📊  Dashboard created: "${d.name}" (id ${d.id})`);
	return d.id;
}

async function deleteDashboard(projectId, dashboardId) {
	await req('DELETE', `/projects/${projectId}/dashboards/${dashboardId}/`);
	console.log(`🗑️   Deleted empty dashboard ${dashboardId}`);
}

async function addInsight(projectId, dashboardId, insight) {
	const i = await req('POST', `/projects/${projectId}/insights/`, {
		name: insight.name,
		description: insight.description,
		query: insight.query,
		dashboards: [dashboardId]
	});
	process.stdout.write(`   ✓ ${insight.name}\n`);
	return i.id;
}

// ── Query builder helpers ─────────────────────────────────────────────────────

/** Single event series node with optional property filters */
function ev(event, { name, math = 'total', props = [] } = {}) {
	const node = { kind: 'EventsNode', event, math };
	if (name) node.name = name;
	if (props.length) node.properties = props;
	return node;
}

/** Property filter — event property equals one of the given values */
function prop(key, values) {
	return { key, value: Array.isArray(values) ? values : [values], operator: 'exact', type: 'event' };
}

/** Wrap a TrendsQuery source into a full InsightVizNode query */
function trends({ series, dateFrom = '-30d', interval = 'day', display = 'ActionsLineGraph', breakdown, formula } = {}) {
	const source = {
		kind: 'TrendsQuery',
		series,
		dateRange: { date_from: dateFrom },
		interval,
		trendsFilter: { display }
	};
	if (breakdown) {
		source.breakdownFilter = {
			breakdowns: [{ property: breakdown, type: 'event' }]
		};
	}
	if (formula) {
		source.trendsFilter.formula = formula;
	}
	return { kind: 'InsightVizNode', source };
}

/** Wrap a FunnelsQuery source into a full InsightVizNode query */
function funnel({ series, dateFrom = '-30d', windowInterval = 7, windowUnit = 'day' } = {}) {
	return {
		kind: 'InsightVizNode',
		source: {
			kind: 'FunnelsQuery',
			series,
			dateRange: { date_from: dateFrom },
			funnelsFilter: {
				funnelWindowInterval: windowInterval,
				funnelWindowIntervalUnit: windowUnit,
				funnelOrderType: 'ordered'
			}
		}
	};
}

// ── Chapter & slug constants ──────────────────────────────────────────────────

const LONGEVITY_CHAPTERS = [
	{ id: 'the-80-percent-claim',      number: 1,  title: 'The 80% Claim' },
	{ id: 'three-eras-of-medicine',    number: 2,  title: 'Three Eras of Medicine' },
	{ id: 'six-diseases',              number: 3,  title: 'The Six Diseases' },
	{ id: 'fitness-gap',               number: 4,  title: 'The Fitness Gap' },
	{ id: 'smeds-framework',           number: 5,  title: 'The S-MEDs Framework' },
	{ id: 'blue-zones',                number: 6,  title: 'Blue Zones' },
	{ id: 'what-critics-get-right',    number: 7,  title: 'What the Critics Get Right' },
	{ id: 'womens-health-gap',         number: 8,  title: "The Women's Health Gap" },
	{ id: 'economics-of-longevity',    number: 9,  title: 'The Economics of Longevity' },
	{ id: 'what-do-you-do-on-monday',  number: 10, title: 'What Do You Do on Monday?' }
];

const UPF_CHAPTERS = [
	{ id: 'the-new-normal',       number: 1, title: 'The New Normal' },
	{ id: 'what-is-it',           number: 2, title: 'What Is It, Actually?' },
	{ id: 'one-month',            number: 3, title: 'One Month. One Experiment.' },
	{ id: 'body-under-siege',     number: 4, title: 'The Body Under Siege' },
	{ id: 'engineered-to-addict', number: 5, title: 'Engineered to Addict' },
	{ id: 'regulatory-vacuum',    number: 6, title: 'The Regulatory Vacuum' },
	{ id: 'inequality',           number: 7, title: 'A Disease of Inequality' },
	{ id: 'eating-the-planet',    number: 8, title: 'Eating the Planet' },
	{ id: 'what-now',             number: 9, title: 'What Now?' }
];

/** Build the per-chapter funnel series for one explainer */
function chapterFunnelSeries(slug, chapters) {
	return chapters.map((ch) =>
		ev('chapter_viewed', {
			name: `Ch ${ch.number}: ${ch.title}`,
			props: [
				prop('explainer_slug', slug),
				prop('chapter_id', ch.id)
			]
		})
	);
}

// ── Insight definitions ───────────────────────────────────────────────────────
function insights() {
	return [

		// ══════════════════════════════════════════════════════════════════════
		// SECTION 1 — SITE-WIDE OVERVIEW
		// ══════════════════════════════════════════════════════════════════════

		{
			name: '👥 Unique visitors — 30 days',
			query: trends({ series: [ev('$pageview', { math: 'dau' })] })
		},
		{
			name: '📄 Total pageviews — 30 days',
			query: trends({ series: [ev('$pageview')] })
		},
		{
			name: '📊 Pageviews by URL (explainer traffic split)',
			description: 'Breakdown by $current_url — shows which explainer pages get the most traffic',
			query: trends({ series: [ev('$pageview')], breakdown: '$current_url', display: 'ActionsBar' })
		},
		{
			name: '✅ Article completion rate — visitors vs completers',
			description: 'Unique readers who completed vs total unique visitors',
			query: trends({
				series: [
					ev('$pageview',        { name: 'Unique visitors',    math: 'dau' }),
					ev('article_completed', { name: 'Completed article', math: 'dau' })
				]
			})
		},
		{
			name: '🐛 Client-side errors',
			query: trends({ series: [ev('$exception')] })
		},

		// ══════════════════════════════════════════════════════════════════════
		// SECTION 2 — ACQUISITION & LANDING FUNNEL
		// ══════════════════════════════════════════════════════════════════════

		{
			name: '🚀 Site-to-read funnel',
			description: 'Landing page → landing CTA → hero CTA → first chapter → article completed',
			query: funnel({
				windowInterval: 1,
				windowUnit: 'day',
				series: [
					ev('$pageview',           { name: 'Visited site' }),
					ev('landing_cta_clicked',  { name: 'Clicked landing CTA' }),
					ev('hero_cta_clicked',     { name: 'Started reading' }),
					ev('chapter_viewed',       { name: 'Read first chapter' }),
					ev('article_completed',    { name: 'Completed article' })
				]
			})
		},
		{
			name: '🖱️ Landing CTA clicks over time',
			query: trends({ series: [ev('landing_cta_clicked')] })
		},
		{
			name: '▶️ Hero "Start reading" CTA — by explainer',
			description: 'Which explainer gets more hero CTA clicks',
			query: trends({ series: [ev('hero_cta_clicked')], breakdown: 'explainer', display: 'ActionsBar' })
		},

		// ══════════════════════════════════════════════════════════════════════
		// SECTION 3 — CROSS-EXPLAINER COMPARISON
		// ══════════════════════════════════════════════════════════════════════

		{
			name: '📖 Chapter views — longevity vs ultra-processed',
			description: 'Total chapter_viewed events split by explainer over time',
			query: trends({ series: [ev('chapter_viewed')], breakdown: 'explainer_slug' })
		},
		{
			name: '🏁 Article completions — by explainer',
			description: 'Which essay converts more readers to completion',
			query: trends({ series: [ev('article_completed')], breakdown: 'explainer', display: 'ActionsBar' })
		},
		{
			name: '📏 Steps viewed (read depth) — by explainer',
			description: 'Total step_viewed events per explainer — proxy for scroll depth and engagement',
			query: trends({ series: [ev('step_viewed')], breakdown: 'explainer_slug' })
		},

		// ══════════════════════════════════════════════════════════════════════
		// SECTION 4 — LONGEVITY: READER FUNNEL (10 CHAPTERS)
		// ══════════════════════════════════════════════════════════════════════

		{
			name: '🧬 Longevity — full chapter drop-off funnel (ch 1→10)',
			description: 'How many readers reach each of the 10 longevity chapters',
			query: funnel({
				windowInterval: 7,
				windowUnit: 'day',
				series: chapterFunnelSeries('longevity', LONGEVITY_CHAPTERS)
			})
		},
		{
			name: '📊 Longevity — chapter views by number',
			description: 'Bar chart of total views per chapter — quickly shows where readers stop',
			query: trends({
				series: [ev('chapter_viewed', {
					props: [prop('explainer_slug', 'longevity')]
				})],
				breakdown: 'chapter_number',
				display: 'ActionsBar'
			})
		},
		{
			name: '🔖 Longevity — most-read chapters (by title)',
			query: trends({
				series: [ev('chapter_viewed', {
					props: [prop('explainer_slug', 'longevity')]
				})],
				breakdown: 'chapter_title',
				display: 'ActionsBar'
			})
		},
		{
			name: '⏱️ Longevity — step depth (steps viewed per chapter)',
			description: 'Which chapters hold attention longest — more steps = more scroll time',
			query: trends({
				series: [ev('step_viewed', {
					props: [prop('explainer_slug', 'longevity')]
				})],
				breakdown: 'chapter_id',
				display: 'ActionsBar'
			})
		},

		// ══════════════════════════════════════════════════════════════════════
		// SECTION 5 — ULTRA-PROCESSED: READER FUNNEL (9 CHAPTERS)
		// ══════════════════════════════════════════════════════════════════════

		{
			name: '🍔 Ultra-Processed — full chapter drop-off funnel (ch 1→9)',
			description: 'How many readers reach each of the 9 ultra-processed chapters',
			query: funnel({
				windowInterval: 7,
				windowUnit: 'day',
				series: chapterFunnelSeries('ultra-processed', UPF_CHAPTERS)
			})
		},
		{
			name: '📊 Ultra-Processed — chapter views by number',
			query: trends({
				series: [ev('chapter_viewed', {
					props: [prop('explainer_slug', 'ultra-processed')]
				})],
				breakdown: 'chapter_number',
				display: 'ActionsBar'
			})
		},
		{
			name: '🔖 Ultra-Processed — most-read chapters (by title)',
			query: trends({
				series: [ev('chapter_viewed', {
					props: [prop('explainer_slug', 'ultra-processed')]
				})],
				breakdown: 'chapter_title',
				display: 'ActionsBar'
			})
		},
		{
			name: '⏱️ Ultra-Processed — step depth (steps viewed per chapter)',
			query: trends({
				series: [ev('step_viewed', {
					props: [prop('explainer_slug', 'ultra-processed')]
				})],
				breakdown: 'chapter_id',
				display: 'ActionsBar'
			})
		},

		// ══════════════════════════════════════════════════════════════════════
		// SECTION 6 — STEP-LEVEL DEEP ENGAGEMENT
		// ══════════════════════════════════════════════════════════════════════

		{
			name: '🔬 Most-viewed steps across both explainers',
			description: 'Individual step_id breakdown — reveals the most compelling content beats',
			query: trends({
				series: [ev('step_viewed')],
				breakdown: 'step_id',
				display: 'ActionsBar'
			})
		},
		{
			name: '📉 Article completion funnel — hero CTA → ch midpoint → completed',
			description: 'Hero CTA → halfway through (ch 5) → article completed — the core engagement funnel',
			query: funnel({
				windowInterval: 1,
				windowUnit: 'day',
				series: [
					ev('hero_cta_clicked', { name: 'Started reading' }),
					ev('chapter_viewed', {
						name: 'Reached ch 5 (midpoint)',
						props: [prop('chapter_number', '5')]
					}),
					ev('article_completed', { name: 'Finished article' })
				]
			})
		},

		// ══════════════════════════════════════════════════════════════════════
		// SECTION 7 — SOURCE & REFERENCE ENGAGEMENT
		// ══════════════════════════════════════════════════════════════════════

		{
			name: '📚 Source interactions — footer clicks + sheet external links',
			description: 'Combined source engagement — signals research-minded readers',
			query: trends({
				series: [
					ev('source_link_clicked',         { name: 'Footer source click' }),
					ev('source_external_link_clicked', { name: 'Sheet external link' })
				]
			})
		},
		{
			name: '🔗 Most-clicked source IDs',
			description: 'Which citations readers click most — reveals the most engaging evidence',
			query: trends({
				series: [ev('source_link_clicked')],
				breakdown: 'source_id',
				display: 'ActionsBar'
			})
		},
		{
			name: '🌐 Most-opened external source URLs',
			description: 'Which external links readers actually follow from source sheets',
			query: trends({
				series: [ev('source_external_link_clicked')],
				breakdown: 'source_url',
				display: 'ActionsBar'
			})
		},
		{
			name: '📋 Editorial sheet opens — by explainer',
			description: '"About this essay" panel opens — signals interest in provenance',
			query: trends({
				series: [ev('editorial_sheet_opened')],
				breakdown: 'explainer',
				display: 'ActionsBar'
			})
		},

		// ══════════════════════════════════════════════════════════════════════
		// SECTION 8 — NAVIGATION BEHAVIOUR
		// ══════════════════════════════════════════════════════════════════════

		{
			name: '🧭 All navigation events over time',
			description: 'Progress bar clicks + sources nav + nav drawer — combined navigation signal',
			query: trends({
				series: [
					ev('progress_bar_chapter_clicked', { name: 'Progress bar click' }),
					ev('sources_nav_clicked',           { name: 'Sources nav click' }),
					ev('nav_drawer_opened',             { name: 'Nav drawer open' })
				]
			})
		},
		{
			name: '🗂️ Progress bar jumps — by chapter (longevity)',
			description: 'Which chapters readers skip to directly — a signal of re-reads or skimming',
			query: trends({
				series: [ev('progress_bar_chapter_clicked', {
					props: [prop('explainer_slug', 'longevity')]
				})],
				breakdown: 'chapter_title',
				display: 'ActionsBar'
			})
		},
		{
			name: '🗂️ Progress bar jumps — by chapter (ultra-processed)',
			query: trends({
				series: [ev('progress_bar_chapter_clicked', {
					props: [prop('explainer_slug', 'ultra-processed')]
				})],
				breakdown: 'chapter_title',
				display: 'ActionsBar'
			})
		},

		// ══════════════════════════════════════════════════════════════════════
		// SECTION 9 — SOCIAL & SHARING
		// ══════════════════════════════════════════════════════════════════════

		{
			name: '📤 Share clicks — by platform',
			description: 'Which platform readers share to most — social proof signal',
			query: trends({
				series: [ev('share_clicked')],
				breakdown: 'platform',
				display: 'ActionsBar'
			})
		},
		{
			name: '📤 Share clicks over time',
			query: trends({ series: [ev('share_clicked')] })
		},
		{
			name: '🔁 Completers who share — conversion funnel',
			description: 'article_completed → share_clicked — what fraction of finishers become sharers',
			query: funnel({
				windowInterval: 1,
				windowUnit: 'day',
				series: [
					ev('article_completed', { name: 'Completed article' }),
					ev('share_clicked',     { name: 'Shared' })
				]
			})
		},

		// ══════════════════════════════════════════════════════════════════════
		// SECTION 10 — WEEKLY TREND & GROWTH
		// ══════════════════════════════════════════════════════════════════════

		{
			name: '📅 Weekly unique readers — 90-day growth trend',
			description: 'Weekly DAU trend — shows whether the audience is growing',
			query: trends({
				series: [ev('$pageview', { math: 'dau' })],
				dateFrom: '-90d',
				interval: 'week'
			})
		},
		{
			name: '📅 Weekly article completions — 90-day trend',
			query: trends({
				series: [ev('article_completed', { math: 'dau' })],
				dateFrom: '-90d',
				interval: 'week'
			})
		},

		// ══════════════════════════════════════════════════════════════════════
		// SECTION 11 — MOBILE / DEVICE PROXY
		// ══════════════════════════════════════════════════════════════════════

		{
			name: '📱 Nav drawer opens — by page (mobile reader distribution)',
			description: 'nav_drawer_opened broken down by page — reveals which explainer has more mobile readers',
			query: trends({
				series: [ev('nav_drawer_opened')],
				breakdown: 'page',
				display: 'ActionsBar'
			})
		}
	];
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
	try {
		console.log(`\n🚀  Connecting to ${HOST} …\n`);

		const projectId = await getProjectId();

		// Clean up empty dashboards left from previous failed runs.
		for (const id of [695583, 695585]) {
			try { await deleteDashboard(projectId, id); } catch { /* already gone */ }
		}

		const dashboardId = await createDashboard(
			projectId,
			'Pixel Poetry — Master Analytics',
			'Full reader analytics across both explainers (Longevity & Ultra-Processed): acquisition funnels, chapter drop-off, step depth, source engagement, sharing, navigation, and growth.'
		);

		const allInsights = insights();
		console.log(`\n📌  Adding ${allInsights.length} insights …\n`);

		for (const insight of allInsights) {
			await addInsight(projectId, dashboardId, insight);
		}

		console.log(`\n🎉  Done! Open your dashboard at:\n   ${HOST}/dashboard/${dashboardId}\n`);
	} catch (err) {
		console.error('\n❌  Error:', err.message);
		process.exit(1);
	}
})();
