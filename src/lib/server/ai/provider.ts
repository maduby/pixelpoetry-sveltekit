import { env } from '$env/dynamic/private';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import type { LanguageModel } from 'ai';

export type PixelPoetryAiProvider = 'gateway' | 'minimax';

export interface PixelPoetryAiModelConfig {
	provider: PixelPoetryAiProvider;
	model: string;
	modelRef: string | LanguageModel;
}

const DEFAULT_GATEWAY_MODEL = 'minimax/minimax-m2.7';
const DEFAULT_MINIMAX_BASE_URL = 'https://api.minimax.io/v1';
const DEFAULT_MINIMAX_MODEL = 'MiniMax-M2.7';

function configuredProvider(): PixelPoetryAiProvider {
	return env.AI_PROVIDER === 'minimax' || env.MINIMAX_API_KEY ? 'minimax' : 'gateway';
}

export function isAiProviderConfigured(): boolean {
	const provider = configuredProvider();
	if (provider === 'minimax') return Boolean(env.MINIMAX_API_KEY);
	return Boolean(env.AI_GATEWAY_API_KEY || env.VERCEL_OIDC_TOKEN);
}

export function getAiModelConfig(): PixelPoetryAiModelConfig {
	const provider = configuredProvider();

	if (provider === 'minimax') {
		if (!env.MINIMAX_API_KEY) {
			throw new Error('MINIMAX_API_KEY is required when AI_PROVIDER=minimax.');
		}

		const model = env.MINIMAX_MODEL || DEFAULT_MINIMAX_MODEL;
		const minimax = createOpenAICompatible({
			name: 'minimax',
			apiKey: env.MINIMAX_API_KEY,
			baseURL: env.MINIMAX_BASE_URL || DEFAULT_MINIMAX_BASE_URL
		});

		return {
			provider,
			model,
			modelRef: minimax(model)
		};
	}

	const model = env.AI_GATEWAY_MODEL || DEFAULT_GATEWAY_MODEL;

	return {
		provider: 'gateway',
		model,
		modelRef: model
	};
}
