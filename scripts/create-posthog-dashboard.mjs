/**
 * Creates the "Ultra-Processed — Reader Engagement" dashboard in PostHog
 * with all insights wired to the events we track.
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
				.map((l) => l.split('=').map((s) => s.trim()))
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

if (!PERSONAL_KEY) {
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

async function addInsight(projectId, dashboardId, insight) {
	const i = await req('POST', `/projects/${projectId}/insights/`, {
		...insight,
		dashboards: [dashboardId]
	});
	process.stdout.write(`   ✓ ${insight.name}\n`);
	return i.id;
}

// ── Insight definitions ───────────────────────────────────────────────────────
function insights(projectId) {
	return [
		// ── Row 1: Top-line overview ──────────────────────────────────────────
		{
			name: '👥 Unique visitors (30 days)',
			filters: {
				insight: 'TRENDS',
				date_from: '-30d',
				events: [{ id: '$pageview', type: 'events', math: 'dau', order: 0 }],
				display: 'ActionsLineGraph'
			}
		},
		{
			name: '📄 Total pageviews (30 days)',
			filters: {
				insight: 'TRENDS',
				date_from: '-30d',
				events: [{ id: '$pageview', type: 'events', math: 'total', order: 0 }],
				display: 'ActionsLineGraph'
			}
		},
		{
			name: '✅ Article completion rate',
			description:
				'% of sessions where the reader reached the footer (article_completed / $pageview sessions)',
			filters: {
				insight: 'TRENDS',
				date_from: '-30d',
				events: [
					{ id: '$pageview', type: 'events', math: 'dau', order: 0, name: 'Visitors' },
					{ id: 'article_completed', type: 'events', math: 'dau', order: 1, name: 'Completed' }
				],
				display: 'ActionsLineGraph'
			}
		},
		{
			name: '📱 Mobile nav opens',
			filters: {
				insight: 'TRENDS',
				date_from: '-30d',
				events: [{ id: 'mobile_nav_opened', type: 'events', math: 'total', order: 0 }],
				display: 'ActionsLineGraph'
			}
		},

		// ── Row 2: Reader journey funnel ──────────────────────────────────────
		{
			name: '🔍 Reader journey funnel',
			description: 'Hero → first chapter → midpoint → article end',
			filters: {
				insight: 'FUNNELS',
				date_from: '-30d',
				funnel_window_interval: 1,
				funnel_window_interval_unit: 'day',
				events: [
					{ id: 'hero_cta_clicked', type: 'events', order: 0, name: 'Clicked "Start reading"' },
					{
						id: 'chapter_viewed',
						type: 'events',
						order: 1,
						name: 'Viewed a chapter',
						properties: []
					},
					{
						id: 'chapter_viewed',
						type: 'events',
						order: 2,
						name: 'Viewed chapter 5+',
						properties: [
							{
								key: 'chapter_number',
								value: ['5', '6', '7', '8', '9'],
								operator: 'exact',
								type: 'event'
							}
						]
					},
					{ id: 'article_completed', type: 'events', order: 3, name: 'Completed article' }
				]
			}
		},

		// ── Row 3: Chapter engagement ─────────────────────────────────────────
		{
			name: '📖 Chapter views — breakdown by chapter',
			description: 'How far readers get through the article',
			filters: {
				insight: 'TRENDS',
				date_from: '-30d',
				events: [{ id: 'chapter_viewed', type: 'events', math: 'total', order: 0 }],
				breakdown: 'chapter_title',
				breakdown_type: 'event',
				display: 'ActionsBarChart'
			}
		},
		{
			name: '📖 Chapter views over time',
			filters: {
				insight: 'TRENDS',
				date_from: '-30d',
				events: [{ id: 'chapter_viewed', type: 'events', math: 'total', order: 0 }],
				display: 'ActionsLineGraph'
			}
		},

		// ── Row 4: Source & reference engagement ─────────────────────────────
		{
			name: '📚 Source interactions',
			description: 'Footer source clicks + source sheet external link clicks',
			filters: {
				insight: 'TRENDS',
				date_from: '-30d',
				events: [
					{
						id: 'source_link_clicked',
						type: 'events',
						math: 'total',
						order: 0,
						name: 'Footer source click'
					},
					{
						id: 'source_external_link_clicked',
						type: 'events',
						math: 'total',
						order: 1,
						name: 'Sheet external link'
					}
				],
				display: 'ActionsBarChart'
			}
		},
		{
			name: '🔗 Most-clicked sources',
			filters: {
				insight: 'TRENDS',
				date_from: '-30d',
				events: [{ id: 'source_link_clicked', type: 'events', math: 'total', order: 0 }],
				breakdown: 'source_id',
				breakdown_type: 'event',
				display: 'ActionsBarChart'
			}
		},

		// ── Row 5: Navigation behaviour ───────────────────────────────────────
		{
			name: '🧭 Navigation events',
			filters: {
				insight: 'TRENDS',
				date_from: '-30d',
				events: [
					{
						id: 'progress_bar_chapter_clicked',
						type: 'events',
						math: 'total',
						order: 0,
						name: 'Progress bar click'
					},
					{
						id: 'sources_nav_clicked',
						type: 'events',
						math: 'total',
						order: 1,
						name: 'Sources nav click'
					},
					{
						id: 'mobile_nav_opened',
						type: 'events',
						math: 'total',
						order: 2,
						name: 'Mobile nav open'
					}
				],
				display: 'ActionsLineGraph'
			}
		},

		// ── Row 6: Errors ─────────────────────────────────────────────────────
		{
			name: '🐛 Client-side errors',
			filters: {
				insight: 'TRENDS',
				date_from: '-30d',
				events: [{ id: '$exception', type: 'events', math: 'total', order: 0 }],
				display: 'ActionsLineGraph'
			}
		}
	];
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
	try {
		console.log(`\n🚀  Connecting to ${HOST} …\n`);

		const projectId = await getProjectId();

		const dashboardId = await createDashboard(
			projectId,
			'Ultra-Processed — Reader Engagement',
			'Tracks the full reader journey: visits → chapter engagement → article completion → source interactions.'
		);

		console.log('\n📌  Adding insights …\n');
		for (const insight of insights(projectId)) {
			await addInsight(projectId, dashboardId, insight);
		}

		console.log(`\n🎉  Done! Open your dashboard at:\n   ${HOST}/dashboard/${dashboardId}\n`);
	} catch (err) {
		console.error('\n❌  Error:', err.message);
		process.exit(1);
	}
})();
