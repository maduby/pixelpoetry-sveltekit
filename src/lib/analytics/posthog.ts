import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import posthog from 'posthog-js';

const PUBLIC_POSTHOG_KEY = env.PUBLIC_POSTHOG_KEY ?? '';
const PUBLIC_POSTHOG_HOST = env.PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com';

export const READER_RESUME_TOAST_FLAG = 'reader-resume-toast-enabled';
export const READER_RESUME_NAV_FLAG = 'reader-resume-nav-enabled';

const featureFlags: Record<string, boolean> = {};
let subscribedToFeatureFlags = false;

/**
 * Initialise PostHog in cookie-free mode.
 * Safe to call multiple times — skips if already initialised or on the server.
 */
export function initPostHog() {
	if (!browser) return;
	if (!PUBLIC_POSTHOG_KEY) return;

	posthog.init(PUBLIC_POSTHOG_KEY, {
		api_host: PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',

		// ── Cookie-free ─────────────────────────────────────────────────────
		// 'memory' keeps state for the tab session only — no cookies, no
		// localStorage writes, GDPR/PECR compliant without a consent banner.
		persistence: 'memory',
		disable_persistence: false,

		// ── Privacy defaults ─────────────────────────────────────────────────
		// Don't create anonymous profiles — only identify on explicit calls.
		person_profiles: 'identified_only',
		// Mask all text content and inputs in session recordings by default.
		session_recording: {
			maskAllInputs: true,
			maskTextSelector: '*'
		},
		// Strip query params that might contain PII.
		sanitize_properties(properties) {
			if (properties['$current_url']) {
				const url = new URL(properties['$current_url'] as string);
				// Remove UTM and potential PII params from recorded URLs.
				['email', 'token', 'code', 'state'].forEach((p) => url.searchParams.delete(p));
				properties['$current_url'] = url.toString();
			}
			return properties;
		},

		// ── SvelteKit SPA ────────────────────────────────────────────────────
		// Disable automatic pageview — we fire it manually after each navigation
		// via afterNavigate so the correct URL/title is captured.
		capture_pageview: false,
		capture_pageleave: true
	});

	ensureFeatureFlagSubscription();
}

/** Fire a pageview event. Call this inside afterNavigate in +layout.svelte. */
export function capturePageView() {
	if (!browser || !PUBLIC_POSTHOG_KEY) return;
	posthog.capture('$pageview', { $current_url: window.location.href });
}

export function readFeatureFlag(key: string): boolean {
	if (!browser || !PUBLIC_POSTHOG_KEY) return false;
	return featureFlags[key] ?? posthog.isFeatureEnabled(key) === true;
}

export function subscribeFeatureFlags(callback: () => void): () => void {
	if (!browser || !PUBLIC_POSTHOG_KEY) return () => {};
	ensureFeatureFlagSubscription();

	const unsubscribe = posthog.onFeatureFlags(() => {
		syncKnownFeatureFlags();
		callback();
	});

	syncKnownFeatureFlags();
	posthog.reloadFeatureFlags();

	return unsubscribe;
}

export { posthog };

function ensureFeatureFlagSubscription() {
	if (!browser || !PUBLIC_POSTHOG_KEY || subscribedToFeatureFlags) return;
	subscribedToFeatureFlags = true;
	posthog.onFeatureFlags(syncKnownFeatureFlags);
}

function syncKnownFeatureFlags() {
	featureFlags[READER_RESUME_TOAST_FLAG] =
		posthog.isFeatureEnabled(READER_RESUME_TOAST_FLAG) === true;
	featureFlags[READER_RESUME_NAV_FLAG] = posthog.isFeatureEnabled(READER_RESUME_NAV_FLAG) === true;
}
