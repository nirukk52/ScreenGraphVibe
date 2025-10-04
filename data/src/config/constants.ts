// Load environment variables first
import { config } from 'dotenv';
config({ path: process.cwd() + '/.env' });

export const DB_CONFIG = {
  POSTGRES_URL: process.env.POSTGRES_URL || 'postgresql://localhost:5432/screengraph',
  SCHEMA_VERSION: '1.0.0',
} as const;

export const MIGRATION_CONFIG = {
  MIGRATIONS_TABLE: 'drizzle_migrations',
  MIGRATIONS_FOLDER: './migrations',
} as const;

export const TABLE_NAMES = {
  RUNS: 'runs',
  SCREENS: 'screens', 
  ACTIONS: 'actions',
  BASELINES: 'baselines',
  JOBS: 'jobs',
} as const;