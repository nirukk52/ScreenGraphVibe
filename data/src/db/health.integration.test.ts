import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startTestDatabase, stopTestDatabase, testCheckDatabaseHealth } from '@screengraph/tests/_utils/fixtures/test-database.js';

describe('Health Check Integration Tests', () => {
  beforeAll(async () => {
    // Setup real test database using Testcontainers
    console.log('Setting up integration test environment with Testcontainers...');
    await startTestDatabase();
  });

  afterAll(async () => {
    // Cleanup test database connection
    console.log('Cleaning up integration test environment...');
    await stopTestDatabase();
  });

  it('should connect to real database and return health status', async () => {
    // Test with real database connection
    const result = await testCheckDatabaseHealth();

    expect(result).toHaveProperty('status');
    expect(result).toHaveProperty('message');
    expect(['healthy', 'unhealthy']).toContain(result.status);
    expect(typeof result.message).toBe('string');
    expect(result.status).toBe('healthy'); // Should be healthy with real test database
  });

  it('should handle database queries correctly', async () => {
    // Test that we can actually query the database
    const result = await testCheckDatabaseHealth();
    
    expect(result.status).toBe('healthy');
    expect(result.message).toContain('Test database connection successful');
  });
});