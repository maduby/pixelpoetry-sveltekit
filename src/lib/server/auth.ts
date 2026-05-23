import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { getRequestEvent } from '$app/server';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { env } from '$env/dynamic/private';
import { db, schema } from '$lib/server/db';

const googleProvider =
	env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
		? {
				google: {
					clientId: env.GOOGLE_CLIENT_ID,
					clientSecret: env.GOOGLE_CLIENT_SECRET
				}
			}
		: undefined;

export const auth = betterAuth({
	baseURL: env.BETTER_AUTH_URL || 'http://localhost:5173',
	secret: env.BETTER_AUTH_SECRET || 'development-secret-change-me-development-secret',
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
