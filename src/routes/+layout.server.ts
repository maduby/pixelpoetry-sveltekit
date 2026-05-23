import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals, url }) => {
	return {
		origin: url.origin,
		user: locals.user
			? {
					id: locals.user.id,
					name: locals.user.name,
					email: locals.user.email,
					image: locals.user.image
				}
			: null
	};
};
