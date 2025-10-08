import { FullConfig } from '@playwright/test';
import { setupTestEnvironment } from './test-env.js';

async function globalSetup(config: FullConfig) {
  console.log('Setting up test environment...');

  // Set up test database and environment
  await setupTestEnvironment();

  console.log('Test environment setup complete');
}

export default globalSetup;
