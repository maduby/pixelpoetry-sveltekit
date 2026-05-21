import { absoluteUrl, indexedPages, xmlEscape } from '$lib/utils/seo';

export function GET() {
	const urls = indexedPages
		.map((page) => {
			const lastmod = page.lastmod ? `\n\t\t<lastmod>${xmlEscape(page.lastmod)}</lastmod>` : '';
			const changefreq = page.changefreq
				? `\n\t\t<changefreq>${page.changefreq}</changefreq>`
				: '';
			const priority =
				typeof page.priority === 'number' ? `\n\t\t<priority>${page.priority.toFixed(1)}</priority>` : '';

			return `\t<url>
\t\t<loc>${xmlEscape(absoluteUrl(page.path))}</loc>${lastmod}${changefreq}${priority}
\t</url>`;
		})
		.join('\n');

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`,
		{
			headers: {
				'Content-Type': 'application/xml; charset=utf-8',
				'Cache-Control': 'public, max-age=3600'
			}
		}
	);
}
