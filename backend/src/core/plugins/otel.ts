/**
 * @module core/plugins/otel
 * @description Placeholder OpenTelemetry registration. Wire actual OTel SDK in infra.
 */
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export const registerOtel = fp(async (_app: FastifyInstance) => {
  // Integrate Fastify OTel instrumentation here if needed.
});


