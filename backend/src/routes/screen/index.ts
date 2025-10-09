/**
 * @module routes/screen
 * @description Groups all screen-related routes.
 * @publicAPI registerScreenRoutes
 */
import type { FastifyInstance } from 'fastify';
import { registerScreenDetailsRoute } from '../../features/screen/details/route.js';
import { getEnv } from '../../core/env.js';
import { getMockedFeatureSet, isMocked } from '../../core/config.js';
import { FakeScreenDetailsAdapter } from '../../features/screen/details/adapters/fake.adapter.js';

export async function registerScreenRoutes(app: FastifyInstance) {
  const env = getEnv();
  const mocked = getMockedFeatureSet(env.MOCK_FEATURES);
  const useFake = isMocked(mocked, 'screen', 'details') || true;
  const port = useFake ? new FakeScreenDetailsAdapter() : new FakeScreenDetailsAdapter();
  await registerScreenDetailsRoute(app, { port });
}


