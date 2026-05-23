import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

const connectionString = env.DATABASE_URL || 'postgresql://user:password@localhost:5432/pixelpoetry';
const sql = neon(connectionString);

export const db = drizzle(sql, { schema });
export { schema };
