import { FastifyInstance } from 'fastify';
import { HealthCheckResponse } from '../types/index.js';
import { randomUUID } from 'crypto';
import { checkSupabaseHealth, getConfig } from '@screengraph/infra';

// Database health check function using infra module
async function checkDatabaseHealth(): Promise<{ status: 'healthy' | 'unhealthy'; message: string }> {
  const healthResult = await checkSupabaseHealth();
  
  if (healthResult.status === 'ok') {
    return { status: 'healthy', message: 'Database connection successful' };
  } else {
    return { 
      status: 'unhealthy', 
      message: `Database connection failed: ${healthResult.details?.error || 'Unknown error'}` 
    };
  }
}

export async function healthRoutes(fastify: FastifyInstance) {
  // Health check endpoint
  fastify.get('/healthz', async (request, reply) => {
    try {
      // Check database health
      const dbHealth = await checkDatabaseHealth();
      const requestId = randomUUID();
      const config = getConfig();
      
      const response: HealthCheckResponse = {
        status: dbHealth.status === 'healthy' ? 'ok' : 'db_down',
        message: dbHealth.status === 'healthy' ? 'All services operational' : dbHealth.message,
        timestamp: new Date().toISOString(),
        requestId,
        region: config.FLY_REGION || 'local',
        environment: config.NODE_ENV,
        services: {
          database: dbHealth.status,
        },
      };

      // Set cache control headers to prevent caching
      reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      reply.header('Pragma', 'no-cache');
      reply.header('Expires', '0');

      // Return appropriate HTTP status
      if (response.status === 'ok') {
        return reply.code(200).send(response);
      } else {
        return reply.code(503).send(response);
      }
    } catch (error) {
      const requestId = randomUUID();
      const config = getConfig();
      const response: HealthCheckResponse = {
        status: 'db_down',
        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
        requestId,
        region: config.FLY_REGION || 'local',
        environment: config.NODE_ENV,
        services: {
          database: 'unhealthy',
        },
      };
      
      // Set cache control headers
      reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      reply.header('Pragma', 'no-cache');
      reply.header('Expires', '0');
      
      return reply.code(503).send(response);
    }
  });
}
