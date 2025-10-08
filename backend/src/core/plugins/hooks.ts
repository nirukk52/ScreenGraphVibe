/**
 * @module core/plugins/hooks
 * @description Common lifecycle hooks (timing, audit). Keep lightweight.
 */
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export const registerHooks = fp(async (app: FastifyInstance) => {
  app.addHook('onResponse', async (req, reply) => {
    const durationMs = typeof (reply as any).elapsedTime === 'number' ? (reply as any).elapsedTime : 0;
    app.logger?.info('request_completed', { method: req.method, url: req.url, status: reply.statusCode, durationMs });
  });
});


