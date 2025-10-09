/**
 * @module routes/graph
 * @description Groups all graph-related routes.
 * @publicAPI registerGraphRoutes
 */
import type { FastifyInstance } from 'fastify';
import { registerGraphGetByRunRoute } from '../../features/graph/get-by-run/route.js';
import { GraphGetByRunAdapter } from '../../adapters/graph/get-by-run.adapter.js';

export async function registerGraphRoutes(app: FastifyInstance) {
  await registerGraphGetByRunRoute(app, { port: new GraphGetByRunAdapter() });
}


