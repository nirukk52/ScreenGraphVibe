import { teardownTestEnvironment } from './test-env.js';

async function globalTeardown() {
  console.log('Tearing down test environment...');

  // Clean up test environment
  await teardownTestEnvironment();

  console.log('Test environment teardown complete');
}

export default globalTeardown;
