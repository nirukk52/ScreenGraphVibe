import type { FastifyInstance } from 'fastify';
import { makeHealthController } from './controller.js';
import type { HealthCheckPort } from './port.js';

export async function registerHealthCheckRoute(app: FastifyInstance, deps: { port: HealthCheckPort }) {
  const handler = makeHealthController({ port: deps.port });
  app.get('/healthz', handler);
}


