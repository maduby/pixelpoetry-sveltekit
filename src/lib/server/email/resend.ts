import { env } from '$env/dynamic/private';
import { Resend } from 'resend';

const DEFAULT_FROM_EMAIL = 'Pixel Poetry <summaries@postman.pixelpoetry.dev>';

let resendClient: Resend | null = null;

export function getResendClient(): Resend {
	if (!env.RESEND_API_KEY) {
		throw new Error('RESEND_API_KEY is not configured.');
	}

	resendClient ??= new Resend(env.RESEND_API_KEY);
	return resendClient;
}

export function getResendFromEmail(): string {
	return env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;
}
