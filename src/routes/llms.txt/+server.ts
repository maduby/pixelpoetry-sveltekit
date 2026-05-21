import { site } from '$lib/data/site';
import { explainers } from '$lib/data/explainers';
import { absoluteUrl, explainerMetas } from '$lib/utils/seo';

export function GET() {
	const explainerLines = explainers
		.map((explainer) => {
			const meta = explainerMetas.find((entry) => entry.slug === explainer.slug);
			const updated = meta?.editorial?.lastUpdated
				? ` Last updated: ${meta.editorial.lastUpdated}.`
				: '';
			return `- [${explainer.title}](${absoluteUrl(explainer.href)}): ${meta?.description ?? explainer.description}${updated}`;
		})
		.join('\n');

	return new Response(
		`# ${site.name}

${site.description}

${site.longDescription}

## Canonical URLs

- Homepage: ${absoluteUrl('/')}
- Explainers index: ${absoluteUrl('/explainers')}
- About: ${absoluteUrl('/about')}

## Explainers

${explainerLines}

## Editorial notes

Pixel Poetry publishes evidence-led interactive essays by Marc Duby. Sources are listed inside each explainer and in each essay's sources panel. The "Why I made this" panel records the latest content update for each piece.
`,
		{
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'Cache-Control': 'public, max-age=3600'
			}
		}
	);
}
