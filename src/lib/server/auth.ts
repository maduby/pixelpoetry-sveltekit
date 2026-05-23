import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { getRequestEvent } from '$app/server';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import {
	BETTER_AUTH_SECRET,
	BETTER_AUTH_URL,
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET
} from '$env/static/private';
import { db, schema } from '$lib/server/db';

const googleProvider =
	GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET
		? {
				google: {
					clientId: GOOGLE_CLIENT_ID,
					clientSecret: GOOGLE_CLIENT_SECRET
				}
			}
		: undefined;

export const auth = betterAuth({
	baseURL: BETTER_AUTH_URL || 'http://localhost:5173',
	secret: BETTER_AUTH_SECRET || 'development-secret-change-me-development-secret',
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema
	}),
	emailAndPassword: {
		enabled: true
	},
	socialProviders: googleProvider,
	plugins: [sveltekitCookies(getRequestEvent)]
});
