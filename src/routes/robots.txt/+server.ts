import { site } from '$lib/data/site';

export function GET() {
	return new Response(
		`User-agent: *
Allow: /

Sitemap: ${site.url}/sitemap.xml
`,
		{
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'Cache-Control': 'public, max-age=3600'
			}
		}
	);
}
