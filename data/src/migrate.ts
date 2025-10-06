import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { MIGRATION_CONFIG } from './config/constants.js';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
import { config } from 'dotenv';
config({ path: process.cwd() + '/.env' });

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const connectionString = process.env.POSTGRES_URL || 'postgresql://localhost:5432/screengraph';
const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    await migrate(db, {
      migrationsFolder: resolve(__dirname, '../db/migrations'),
    });
    
    console.log('✅ Database migrations completed successfully');
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations().catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

export { runMigrations };
