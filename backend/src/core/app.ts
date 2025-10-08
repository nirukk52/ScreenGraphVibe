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

export async function createApp() {
  const app = Fastify({ logger: false });
  await registerLogging(app);
  await registerCors(app);
  await registerSecurity(app);
  await registerOtel(app);
  await registerHooks(app);
  return app;
}


