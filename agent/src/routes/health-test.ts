import { FastifyInstance } from 'fastify';
import { HealthCheckResponse } from '../types/index.js';
import { randomUUID } from 'crypto';

export async function healthTestRoutes(fastify: FastifyInstance) {
  // Test health check endpoint that doesn't require database
  fastify.get('/healthz', async (request, reply) => {
    const response: HealthCheckResponse = {
      status: 'healthy',
      message: 'Test mode - all services operational',
      timestamp: new Date().toISOString(),
      requestId: randomUUID(),
      services: {
        database: 'healthy',
      },
    };

    return reply.code(200).send(response);
  });
}
