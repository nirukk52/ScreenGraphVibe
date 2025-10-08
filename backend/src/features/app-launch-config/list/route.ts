import type { FastifyInstance } from 'fastify';
import { makeAppLaunchConfigListController } from './controller.js';
import type { AppLaunchConfigListPort } from './port.js';

export async function registerAppLaunchConfigListRoute(app: FastifyInstance, deps: { port: AppLaunchConfigListPort }) {
  const handler = makeAppLaunchConfigListController({ port: deps.port });
  app.get('/app-launch-configs', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  apkPath: { type: 'string' },
                  packageName: { type: 'string' },
                  appActivity: { type: 'string' },
                  appiumServerUrl: { type: 'string' },
                  isDefault: { type: 'boolean' },
                },
                required: ['id', 'name', 'apkPath', 'packageName', 'appActivity', 'appiumServerUrl'],
              },
            },
            trace_id: { type: 'string' },
          },
          required: ['items', 'trace_id'],
        },
      },
    },
  }, handler);
}


