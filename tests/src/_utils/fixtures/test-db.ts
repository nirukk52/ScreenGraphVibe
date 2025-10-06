import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../../data/src/db/schema.js';

let testContainer: PostgreSqlContainer | null = null;
let testDb: ReturnType<typeof drizzle> | null = null;
let testConnection: ReturnType<typeof postgres> | null = null;

export async function startTestDatabase() {
  if (testContainer) {
    return { container: testContainer, db: testDb!, connection: testConnection! };
  }

  // Start PostgreSQL container
  testContainer = await new PostgreSqlContainer('postgres:15')
    .withDatabase('screengraph_test')
    .withUsername('test')
    .withPassword('test')
    .withExposedPorts(5432)
    .start();

  // Create connection to test database
  const connectionString = testContainer.getConnectionUri();
  testConnection = postgres(connectionString, { max: 1 });
  testDb = drizzle(testConnection, { schema });

  // Run migrations (if any exist)
  // TODO: Add migration runner here when migrations are created

  return { container: testContainer, db: testDb, connection: testConnection };
}

export async function stopTestDatabase() {
  if (testConnection) {
    await testConnection.end();
    testConnection = null;
  }
  if (testContainer) {
    await testContainer.stop();
    testContainer = null;
  }
  testDb = null;
}

export function getTestDb() {
  if (!testDb) {
    throw new Error('Test database not started. Call startTestDatabase() first.');
  }
  return testDb;
}

export function getTestConnection() {
  if (!testConnection) {
    throw new Error('Test connection not started. Call startTestDatabase() first.');
  }
  return testConnection;
}

export function getTestDatabaseUrl() {
  if (!testContainer) {
    throw new Error('Test container not started. Call startTestDatabase() first.');
  }
  return testContainer.getConnectionUri();
}
