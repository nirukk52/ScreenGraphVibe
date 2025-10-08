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
import { FakeHealthCheckAdapter } from '../features/health/check/adapters/fake.adapter.js';
import { FakeAppLaunchConfigListAdapter } from '../features/app-launch-config/list/adapters/fake.adapter.js';
import { getEnv } from '../core/env.js';
import { getMockedFeatureSet, isMocked } from '../core/config.js';

export async function registerRoutes(app: FastifyInstance) {
  const env = getEnv();
  const mocked = getMockedFeatureSet(env.MOCK_FEATURES);

  const healthPort = isMocked(mocked, 'health', 'check')
    ? new FakeHealthCheckAdapter()
    : new HealthAdapter();
  await registerHealthCheckRoute(app, { port: healthPort });

  await registerGraphGetByRunRoute(app, { port: new GraphGetByRunAdapter() });
  const appLaunchPort = isMocked(mocked, 'app-launch-config', 'list')
    ? new FakeAppLaunchConfigListAdapter()
    : new AppLaunchConfigListAdapter();
  await registerAppLaunchConfigListRoute(app, { port: appLaunchPort });
}
