import type { FastifyInstance } from 'fastify';
import { makeAppLaunchConfigListController } from './controller.js';
import type { AppLaunchConfigListPort } from './port.js';

export async function registerAppLaunchConfigListRoute(app: FastifyInstance, deps: { port: AppLaunchConfigListPort }) {
  const handler = makeAppLaunchConfigListController({ port: deps.port });
  app.get('/app-launch-configs', handler);
}


