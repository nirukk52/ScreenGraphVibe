/**
 * @module routes/app-launch-config
 * @description Groups all app-launch-config-related routes.
 * @publicAPI registerAppLaunchConfigRoutes
 */
import type { FastifyInstance } from 'fastify';
import { registerAppLaunchConfigListRoute } from '../../features/app-launch-config/list/route.js';
import { AppLaunchConfigListAdapter } from '../../adapters/app-launch-config/list.adapter.js';
import { FakeAppLaunchConfigListAdapter } from '../../features/app-launch-config/list/adapters/fake.adapter.js';
import { getEnv } from '../../core/env.js';
import { getMockedFeatureSet, isMocked } from '../../core/config.js';

export async function registerAppLaunchConfigRoutes(app: FastifyInstance) {
  const env = getEnv();
  const mocked = getMockedFeatureSet(env.MOCK_FEATURES);
  const appLaunchPort = isMocked(mocked, 'app-launch-config', 'list')
    ? new FakeAppLaunchConfigListAdapter()
    : new AppLaunchConfigListAdapter();
  await registerAppLaunchConfigListRoute(app, { port: appLaunchPort });
}


