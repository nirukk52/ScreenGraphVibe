/**
 * @module core/app
 * @description Constructs a Fastify instance with plugins and hooks; does not call listen().
 * @dependencies fastify, core/plugins/*, routes/index (optional)
 * @publicAPI createApp
 */
import Fastify from 'fastify';
import { registerLogging } from './plugins/logging.js';
import { registerCors } from './plugins/cors.js';
import { registerSecurity } from './plugins/security.js';
import { registerOtel } from './plugins/otel.js';
import { registerHooks } from './plugins/hooks.js';
import { registerSwagger } from './plugins/swagger.js';
import { setErrorHandling } from './error.js';
import { registerRoutes } from '../routes/index.js';
import { getConfig } from './config.js';

export async function createApp() {
  const cfg = getConfig();
  const app = Fastify({ logger: false, bodyLimit: 1_048_576 });
  await registerLogging(app);
  await registerCors(app);
  await registerSecurity(app);
  await registerOtel(app);
  await registerSwagger(app);
  await registerHooks(app);
  await registerRoutes(app);
  setErrorHandling(app);
  return app;
}
