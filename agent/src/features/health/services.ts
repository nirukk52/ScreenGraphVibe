import { randomUUID } from 'crypto';
import type { HealthCheckResponse } from './types.js';

// Simple database health check
export async function checkDatabaseHealth(): Promise<{ status: 'healthy' | 'unhealthy'; message: string }> {
  try {
    // Check if POSTGRES_URL is configured
    if (!process.env.POSTGRES_URL) {
      return { status: 'unhealthy', message: 'Database not configured' };
    }
    
    // For now, just check if env var is set
    // TODO: Add actual DB connection check
    return { status: 'healthy', message: 'Database connection configured' };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      message: `Database check failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

export function createHealthResponse(
  dbHealth: { status: 'healthy' | 'unhealthy'; message: string },
  requestId: string = randomUUID()
): HealthCheckResponse {
  return {
    status: dbHealth.status === 'healthy' ? 'ok' : 'db_down',
    message: dbHealth.status === 'healthy' ? 'All services operational' : dbHealth.message,
    timestamp: new Date().toISOString(),
    requestId,
    region: process.env.FLY_REGION || 'local',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: dbHealth.status,
      redis: 'healthy', // TODO: Add actual Redis health check
    },
  };
}

export function createErrorHealthResponse(
  error: unknown,
  requestId: string = randomUUID()
): HealthCheckResponse {
  return {
    status: 'db_down',
    message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    timestamp: new Date().toISOString(),
    requestId,
    region: process.env.FLY_REGION || 'local',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'unhealthy',
      redis: 'unhealthy',
    },
  };
}
