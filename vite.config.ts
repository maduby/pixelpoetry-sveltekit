import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	ssr: {
		// bits-ui ships raw .svelte files — must be bundled, not externalised.
		noExternal: ['bits-ui']
	}
});
