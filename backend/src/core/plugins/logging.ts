/**
 * @module core/plugins/logging
 * @description Registers Pino logger via @screengraph/logging and exposes request-scoped logger.
 */
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { logger as baseLogger } from '@screengraph/logging';

export const registerLogging = fp(async (app: FastifyInstance) => {
  app.decorate('logger', baseLogger);
  app.addHook('onRequest', async (req) => {
    const requestId = (req.headers['x-request-id'] as string) || req.id;
    // expose trace id downstream
    (req as any).trace_id = requestId;
    // Attach request-scoped context if needed
    baseLogger.info('incoming_request', { trace_id: requestId, method: req.method, url: req.url });
  });
});

declare module 'fastify' {
  interface FastifyInstance {
    logger: typeof baseLogger;
  }
}
