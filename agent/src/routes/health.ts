import { FastifyInstance } from 'fastify';
import { checkDatabaseHealth } from '@screengraph/data';
import { HealthCheckResponse } from '../types/index.js';
import { randomUUID } from 'crypto';

export async function healthRoutes(fastify: FastifyInstance) {
  // Health check endpoint
  fastify.get('/healthz', async (request, reply) => {
    try {
      // Check database health
      const dbHealth = await checkDatabaseHealth();
      const requestId = randomUUID();
      
      const response: HealthCheckResponse = {
        status: dbHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
        message: dbHealth.status === 'healthy' ? 'All services operational' : dbHealth.message,
        timestamp: new Date().toISOString(),
        requestId,
        services: {
          database: dbHealth.status,
        },
      };

      // Set cache control headers to prevent caching
      reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      reply.header('Pragma', 'no-cache');
      reply.header('Expires', '0');

      // Return appropriate HTTP status
      if (response.status === 'healthy') {
        return reply.code(200).send(response);
      } else {
        return reply.code(503).send(response);
      }
    } catch (error) {
      const requestId = randomUUID();
      const response: HealthCheckResponse = {
        status: 'unhealthy',
        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
        requestId,
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
