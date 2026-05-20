// Prerender all routes by default. The home page is fully static — content
// is hardcoded — so this gives us the fastest possible serve from Vercel's
// edge cache.
export const prerender = true;
