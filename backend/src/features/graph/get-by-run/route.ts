import type { FastifyInstance } from 'fastify';
import { makeGraphGetByRunController } from './controller.js';
import type { GraphGetByRunPort } from './port.js';

export async function registerGraphGetByRunRoute(app: FastifyInstance, deps: { port: GraphGetByRunPort }) {
  const handler = makeGraphGetByRunController({ port: deps.port });
  app.get('/graph/:runId', handler);
}


