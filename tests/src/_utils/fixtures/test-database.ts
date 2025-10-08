/**
 * Test database setup using Testcontainers
 * Provides real Postgres instance for integration tests
 */

import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';

let testContainer: StartedPostgreSqlContainer | null = null;
let testDb: ReturnType<typeof drizzle> | null = null;

/**
 * Start a test Postgres container for integration tests
 * This provides a real database instance that matches production
 */
export async function startTestDatabase(): Promise<{
  container: StartedPostgreSqlContainer;
  db: ReturnType<typeof drizzle>;
  connectionString: string;
}> {
  if (testContainer && testDb) {
    return {
      container: testContainer,
      db: testDb,
      connectionString: testContainer.getConnectionUri(),
    };
  }

  console.log('🐳 Starting Postgres test container...');

  testContainer = await new PostgreSqlContainer('postgres:15')
    .withDatabase('screengraph_test')
    .withUsername('test')
    .withPassword('test')
    .withExposedPorts(5432)
    .start();

  const connectionString = testContainer.getConnectionUri();

  // Create connection
  const connection = postgres(connectionString, { max: 1 });
  testDb = drizzle(connection);

  console.log('✅ Test database container started:', connectionString);

  return {
    container: testContainer,
    db: testDb,
    connectionString,
  };
}

/**
 * Stop the test database container
 */
export async function stopTestDatabase(): Promise<void> {
  if (testContainer) {
    console.log('🛑 Stopping Postgres test container...');
    await testContainer.stop();
    testContainer = null;
    testDb = null;
    console.log('✅ Test database container stopped');
  }
}

/**
 * Get the current test database instance
 * Must be called after startTestDatabase()
 */
export function getTestDatabase(): ReturnType<typeof drizzle> {
  if (!testDb) {
    throw new Error('Test database not started. Call startTestDatabase() first.');
  }
  return testDb;
}

/**
 * Health check function for the test database
 * Uses the same interface as the production checkDatabaseHealth
 */
export async function testCheckDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  message: string;
}> {
  try {
    if (!testDb) {
      return {
        status: 'unhealthy',
        message: 'Test database not initialized',
      };
    }

    // Simple query to check database connectivity
    await testDb.execute(sql`SELECT 1 as health_check`);

    return {
      status: 'healthy',
      message: 'Test database connection successful',
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Test database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
