/**
 * @module routes/index
 * @description Registers feature routes. Keep composition in one place.
 * @publicAPI registerRoutes
 */
import type { FastifyInstance } from 'fastify';
import { registerHealthCheckRoute } from '../features/health/check/route.js';
import { registerGraphGetByRunRoute } from '../features/graph/get-by-run/route.js';
import { registerAppLaunchConfigListRoute } from '../features/app-launch-config/list/route.js';
import { HealthAdapter } from '../adapters/health/health.adapter.js';
import { GraphGetByRunAdapter } from '../adapters/graph/get-by-run.adapter.js';
import { AppLaunchConfigListAdapter } from '../adapters/app-launch-config/list.adapter.js';

export async function registerRoutes(app: FastifyInstance) {
  await registerHealthCheckRoute(app, { port: new HealthAdapter() });
  await registerGraphGetByRunRoute(app, { port: new GraphGetByRunAdapter() });
  await registerAppLaunchConfigListRoute(app, { port: new AppLaunchConfigListAdapter() });
}
