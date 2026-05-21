import { redirect } from '@sveltejs/kit';

export function GET() {
	redirect(308, '/explainers/ultra-processed/images/share-image--upf.png');
}
