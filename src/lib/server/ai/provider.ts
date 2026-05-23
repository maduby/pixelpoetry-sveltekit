import { env } from '$env/dynamic/private';

export type PixelPoetryAiProvider = 'gateway';

export interface PixelPoetryAiModelConfig {
	provider: PixelPoetryAiProvider;
	model: string;
	modelRef: string;
}

const DEFAULT_GATEWAY_MODEL = 'minimax/minimax-m2.7';

export function getAiModelConfig(): PixelPoetryAiModelConfig {
	const model = env.AI_GATEWAY_MODEL || DEFAULT_GATEWAY_MODEL;

	return {
		provider: 'gateway',
		model,
		modelRef: model
	};
}
