import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { DATABASE_URL } from '$env/static/private';
import * as schema from './schema';

const connectionString = DATABASE_URL || 'postgresql://user:password@localhost:5432/pixelpoetry';
const sql = neon(connectionString);

export const db = drizzle(sql, { schema });
export { schema };
