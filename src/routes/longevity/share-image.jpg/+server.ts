import { redirect } from '@sveltejs/kit';

export function GET() {
	redirect(308, '/explainers/longevity/images/share-image--longevity.png');
}
