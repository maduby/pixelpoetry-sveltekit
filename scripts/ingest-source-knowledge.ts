import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { config } from 'dotenv';
import { ingestSourceKnowledge } from '$lib/server/sources/source-index';
import * as schema from '$lib/server/db/schema';

config({ path: '.env.local' });
config();

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error('Missing DATABASE_URL_UNPOOLED or DATABASE_URL.');
}

const sql = neon(connectionString);
const db = drizzle(sql, { schema });

const result = await ingestSourceKnowledge(db, process.env);
console.log(
	JSON.stringify(
		{
			sourceDocuments: result.documents,
			sourceChunks: result.chunks,
			embeddedChunks: result.embeddedChunks,
			embeddingsEnabled: process.env.SOURCE_EMBEDDINGS_ENABLED === 'true'
		},
		null,
		2
	)
);
