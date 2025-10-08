import type { FastifyRequest, FastifyReply } from 'fastify';
import { HealthCheckRequestSchema } from './schemas/request.schema.js';
import { HealthCheckResponseSchema } from './schemas/response.schema.js';
import { makeHealthCheckUseCase } from './usecase.js';
import type { HealthCheckPort } from './port.js';

export function makeHealthController(deps: { port: HealthCheckPort }) {
  const execute = makeHealthCheckUseCase({ port: deps.port });

  return async function handler(request: FastifyRequest, reply: FastifyReply) {
    const parsed = HealthCheckRequestSchema.safeParse({});
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid request' });
    }
    const result = await execute();
    const valid = HealthCheckResponseSchema.safeParse({ ...result, trace_id: request.id });
    if (!valid.success) {
      return reply.code(500).send({ error: 'Invalid response shape' });
    }
    return reply.code(200).send(valid.data);
  };
}


