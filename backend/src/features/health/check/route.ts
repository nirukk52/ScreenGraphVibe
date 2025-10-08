import type { FastifyInstance } from 'fastify';
import { makeHealthController } from './controller.js';
import type { HealthCheckPort } from './port.js';

export async function registerHealthCheckRoute(app: FastifyInstance, deps: { port: HealthCheckPort }) {
  const handler = makeHealthController({ port: deps.port });
  app.get('/healthz', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['ok', 'error'] },
            requestId: { type: 'string' },
            trace_id: { type: 'string' },
          },
          required: ['status', 'requestId', 'trace_id'],
        },
      },
    },
  }, handler);
}


