/**
 * @module routes/health
 * @description Groups all health-related routes.
 * @publicAPI registerHealthRoutes
 */
import type { FastifyInstance } from 'fastify';
import { registerHealthCheckRoute } from '../../features/health/check/route.js';
import { HealthAdapter } from '../../adapters/health/health.adapter.js';
import { FakeHealthCheckAdapter } from '../../features/health/check/adapters/fake.adapter.js';
import { getEnv } from '../../core/env.js';
import { getMockedFeatureSet, isMocked } from '../../core/config.js';

export async function registerHealthRoutes(app: FastifyInstance) {
  const env = getEnv();
  const mocked = getMockedFeatureSet(env.MOCK_FEATURES);
  const healthPort = isMocked(mocked, 'health', 'check')
    ? new FakeHealthCheckAdapter()
    : new HealthAdapter();
  await registerHealthCheckRoute(app, { port: healthPort });
}


