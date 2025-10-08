/**
 * @module core/server
 * @description Loads env, builds app, and listens on configured port.
 * @publicAPI startServer
 */
import { createApp } from './app.js';
import { getEnv } from './env.js';

export async function startServer() {
  const env = getEnv();
  const app = await createApp();
  await app.listen({ host: '0.0.0.0', port: env.PORT });
  return app;
}


