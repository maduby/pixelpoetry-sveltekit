import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url }) => {
	if (!locals.user) {
		const redirectTo = `${url.pathname}${url.search}`;
		throw redirect(303, `/login?redirectTo=${encodeURIComponent(redirectTo)}`);
	}

	return {
		user: {
			id: locals.user.id,
			name: locals.user.name,
			email: locals.user.email,
			image: locals.user.image
		}
	};
};
