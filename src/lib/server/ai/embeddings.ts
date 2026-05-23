import { embed } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

export interface EmbeddingEnv {
	SOURCE_EMBEDDINGS_ENABLED?: string;
	EMBEDDING_API_KEY?: string;
	EMBEDDING_BASE_URL?: string;
	EMBEDDING_MODEL?: string;
	EMBEDDING_DIMENSIONS?: string;
}

export interface EmbeddingConfig {
	enabled: boolean;
	model: string;
	dimensions: number;
}

const DEFAULT_EMBEDDING_DIMENSIONS = 1536;

export function getEmbeddingConfig(env: EmbeddingEnv): EmbeddingConfig {
	const enabled =
		env.SOURCE_EMBEDDINGS_ENABLED === 'true' &&
		Boolean(env.EMBEDDING_API_KEY && env.EMBEDDING_BASE_URL && env.EMBEDDING_MODEL);

	return {
		enabled,
		model: env.EMBEDDING_MODEL || '',
		dimensions: Number(env.EMBEDDING_DIMENSIONS || DEFAULT_EMBEDDING_DIMENSIONS)
	};
}

export async function embedSourceText(
	text: string,
	env: EmbeddingEnv
): Promise<{ embedding: number[]; model: string } | null> {
	const config = getEmbeddingConfig(env);
	if (!config.enabled) return null;

	const provider = createOpenAICompatible({
		name: 'source-embeddings',
		apiKey: env.EMBEDDING_API_KEY!,
		baseURL: env.EMBEDDING_BASE_URL!
	});
	const result = await embed({
		model: provider.embeddingModel(config.model),
		value: text
	});

	if (result.embedding.length !== config.dimensions) {
		throw new Error(
			`Embedding dimension mismatch: expected ${config.dimensions}, received ${result.embedding.length}.`
		);
	}

	return { embedding: result.embedding, model: config.model };
}
