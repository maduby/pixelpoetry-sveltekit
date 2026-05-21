import { site } from '$lib/data/site';
import { explainers } from '$lib/data/explainers';
import { meta as longevityMeta } from '$lib/explainers/longevity/meta';
import { meta as ultraProcessedMeta } from '$lib/explainers/ultra-processed/meta';

const monthMap: Record<string, string> = {
	january: '01',
	february: '02',
	march: '03',
	april: '04',
	may: '05',
	june: '06',
	july: '07',
	august: '08',
	september: '09',
	october: '10',
	november: '11',
	december: '12'
};

export interface SeoPage {
	path: string;
	title: string;
	description: string;
	lastmod?: string;
	changefreq?: 'daily' | 'weekly' | 'monthly' | 'yearly';
	priority?: number;
}

export function normalizePath(path = '/'): string {
	const clean = path.split('?')[0].split('#')[0] || '/';
	if (clean === '/') return clean;
	return clean.replace(/\/+$/, '');
}

export function absoluteUrl(pathOrUrl = '/'): string {
	if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
	const path = normalizePath(pathOrUrl);
	return `${site.url}${path === '/' ? '' : path}`;
}

export function absoluteAssetUrl(pathOrUrl: string): string {
	if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
	return `${site.url}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
}

export function dateOnlyFromDisplayDate(value?: string): string | undefined {
	if (!value) return undefined;
	const match = value.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
	if (!match) return undefined;
	const [, day, month, year] = match;
	const monthNumber = monthMap[month.toLowerCase()];
	if (!monthNumber) return undefined;
	return `${year}-${monthNumber}-${day.padStart(2, '0')}`;
}

export function xmlEscape(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export const explainerMetas = [ultraProcessedMeta, longevityMeta] as const;

export const latestContentDate =
	explainerMetas
		.map((meta) => dateOnlyFromDisplayDate(meta.editorial?.lastUpdated) ?? meta.publishedAt)
		.filter((date): date is string => Boolean(date))
		.sort()
		.at(-1) ?? '2026-05-21';

export const indexedPages: SeoPage[] = [
	{
		path: '/',
		title: site.name,
		description: site.description,
		lastmod: latestContentDate,
		changefreq: 'weekly',
		priority: 1
	},
	{
		path: '/explainers',
		title: 'All explainers',
		description:
			'The growing Pixel Poetry library: published essays, unfinished ideas, and what comes next.',
		lastmod: latestContentDate,
		changefreq: 'weekly',
		priority: 0.9
	},
	{
		path: '/about',
		title: 'About Pixel Poetry',
		description: site.longDescription,
		lastmod: latestContentDate,
		changefreq: 'monthly',
		priority: 0.5
	},
	...explainers.flatMap((explainer) => {
		const meta = explainerMetas.find((entry) => entry.slug === explainer.slug);
		const lastmod =
			dateOnlyFromDisplayDate(meta?.editorial?.lastUpdated) ??
			meta?.publishedAt ??
			explainer.publishedAt;

		return [
			{
				path: explainer.topicHref,
				title: `${explainer.title} topic hub`,
				description: explainer.description,
				lastmod,
				changefreq: 'monthly' as const,
				priority: 0.75
			},
			{
				path: explainer.href,
				title: explainer.title,
				description: meta?.description ?? explainer.description,
				lastmod,
				changefreq: 'monthly' as const,
				priority: explainer.status === 'published' ? 0.95 : 0.8
			}
		];
	})
];

export function breadcrumbJsonLd(path: string) {
	const normalized = normalizePath(path);
	const segments = normalized.split('/').filter(Boolean);
	const items = [
		{
			'@type': 'ListItem',
			position: 1,
			name: site.name,
			item: absoluteUrl('/')
		},
		...segments.map((segment, index) => {
			const itemPath = `/${segments.slice(0, index + 1).join('/')}`;
			return {
				'@type': 'ListItem',
				position: index + 2,
				name: segment
					.split('-')
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(' '),
				item: absoluteUrl(itemPath)
			};
		})
	];

	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items
	};
}
