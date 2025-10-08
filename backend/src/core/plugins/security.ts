/**
 * @module core/plugins/security
 * @description Basic security headers and rate-limiting placeholder.
 */
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export const registerSecurity = fp(async (app: FastifyInstance) => {
  app.addHook('onRequest', async (req, reply) => {
    reply.header('X-Frame-Options', 'DENY');
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('Referrer-Policy', 'no-referrer');
  });
});
