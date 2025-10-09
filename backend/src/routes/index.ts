/**
 * @module routes/index
 * @description Registers feature routes. Keep composition in one place.
 * @publicAPI registerRoutes
 */
import type { FastifyInstance } from 'fastify';
import { registerHealthRoutes } from './health/index.js';
import { registerGraphRoutes } from './graph/index.js';
import { registerAppLaunchConfigRoutes } from './app-launch-config/index.js';
import { registerScreenRoutes } from './screen/index.js';

export async function registerRoutes(app: FastifyInstance) {
  await registerHealthRoutes(app);
  await registerGraphRoutes(app);
  await registerAppLaunchConfigRoutes(app);
  await registerScreenRoutes(app);
}
