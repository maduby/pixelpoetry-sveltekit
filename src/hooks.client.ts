import type { HandleClientError } from '@sveltejs/kit';
import { posthog } from '$lib/analytics/posthog';

export const handleError: HandleClientError = async ({ error, status, message }) => {
	posthog.captureException(error);
	return { message, status };
};
