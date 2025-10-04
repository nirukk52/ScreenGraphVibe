import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.POSTGRES_URL || 'postgresql://localhost:5432/screengraph',
  },
} satisfies Config;
