import { startTestDatabase, stopTestDatabase, getTestDatabaseUrl } from './test-db.js';

let testEnv: {
  databaseUrl: string;
  agentPort: number;
  uiPort: number;
} | null = null;

export async function setupTestEnvironment() {
  if (testEnv) {
    return testEnv;
  }

  // Start test database
  const { container } = await startTestDatabase();
  const databaseUrl = getTestDatabaseUrl();

  testEnv = {
    databaseUrl,
    agentPort: 3000,
    uiPort: 3001,
  };

  // Set environment variables for test processes
  process.env.POSTGRES_URL = databaseUrl;
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error'; // Reduce log noise in tests

  return testEnv;
}

export async function teardownTestEnvironment() {
  if (testEnv) {
    await stopTestDatabase();
    testEnv = null;
    
    // Clean up environment variables
    delete process.env.POSTGRES_URL;
    delete process.env.NODE_ENV;
    delete process.env.LOG_LEVEL;
  }
}

export function getTestEnvironment() {
  if (!testEnv) {
    throw new Error('Test environment not set up. Call setupTestEnvironment() first.');
  }
  return testEnv;
}
