/**
 * @module core/plugins/cors
 * @description Registers CORS with safe defaults; configure origins via env or constants.
 */
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import cors from '@fastify/cors';

export const registerCors = fp(async (app: FastifyInstance) => {
  await app.register(cors, {
    origin: ['http://localhost:3001'],
    credentials: true,
  });
});
