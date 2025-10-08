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
  APP_LAUNCH_CONFIGS: 'app_launch_configs',
} as const;

export const DEFAULT_APP_CONFIG = {
  APK_PATH: '/Users/priyankalalge/SAAS/Scoreboard/AppiumPythonClient/test/apps/kotlinconf.apk',
  PACKAGE_NAME: 'com.jetbrains.kotlinconf',
  APP_ACTIVITY: '.*',
  APPIUM_SERVER_URL: 'http://127.0.0.1:4723/',
  CONFIG_NAME: 'Default KotlinConf',
} as const;
