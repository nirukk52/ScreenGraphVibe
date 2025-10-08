import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as schema from './schema/index.js';
import { DB_CONFIG } from '../../config/constants.js';

// Create connection
const connection = postgres(DB_CONFIG.POSTGRES_URL, { max: 1 });

// Create database instance
export const db = drizzle(connection, { schema });

// Health check function
export async function checkDatabaseHealth(): Promise<{ status: 'healthy' | 'unhealthy'; message: string }> {
  try {
    await db.execute(sql`SELECT 1 as health_check`);
    return { status: 'healthy', message: 'Database connection successful' };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export { schema };


