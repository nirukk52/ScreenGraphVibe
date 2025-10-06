/**
 * Health check mocks for testing
 * This module provides test-specific implementations that don't require database connectivity
 */

import { HealthCheckResponse } from '@screengraph/agent/types';
import { randomUUID } from 'crypto';

/**
 * Mock health check response for tests that don't need database connectivity
 * Returns a healthy status without attempting database connection
 */
export function createMockHealthResponse(): HealthCheckResponse {
  return {
    status: 'healthy',
    message: 'Test mode - all services operational',
    timestamp: new Date().toISOString(),
    requestId: randomUUID(),
    services: {
      database: 'healthy',
    },
  };
}

/**
 * Mock health check response with unhealthy status for testing error scenarios
 */
export function createMockUnhealthyResponse(): HealthCheckResponse {
  return {
    status: 'unhealthy',
    message: 'Test mode - database service unavailable',
    timestamp: new Date().toISOString(),
    requestId: randomUUID(),
    services: {
      database: 'unhealthy',
    },
  };
}

/**
 * Mock database health check function for unit tests
 * This replaces the real checkDatabaseHealth function during testing
 */
export async function mockCheckDatabaseHealth(
  shouldFail: boolean = false
): Promise<{ status: 'healthy' | 'unhealthy'; message: string }> {
  if (shouldFail) {
    return {
      status: 'unhealthy',
      message: 'Test mode - simulated database connection failure',
    };
  }
  
  return {
    status: 'healthy',
    message: 'Test mode - simulated successful database connection',
  };
}
