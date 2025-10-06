import { FastifyInstance } from 'fastify';
import { HealthCheckResponse } from './types.js';
import { checkDatabaseHealth, createHealthResponse, createErrorHealthResponse } from './services.js';
import { randomUUID } from 'crypto';

export async function healthRoutes(fastify: FastifyInstance) {
  // Health check endpoint
  fastify.get('/healthz', async (request, reply) => {
    try {
      // Check database health
      const dbHealth = await checkDatabaseHealth();
      const requestId = randomUUID();
      
      const response: HealthCheckResponse = createHealthResponse(dbHealth, requestId);

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
      const response: HealthCheckResponse = createErrorHealthResponse(error, requestId);
      
      // Set cache control headers
      reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      reply.header('Pragma', 'no-cache');
      reply.header('Expires', '0');
      
      return reply.code(503).send(response);
    }
  });
}
