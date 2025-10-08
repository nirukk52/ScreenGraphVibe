import type { FastifyRequest, FastifyReply } from 'fastify';
import { GraphGetByRunParamsSchema } from './schemas/request.schema.js';
import { GraphGetByRunResponseSchema } from './schemas/response.schema.js';
import { makeGetByRunUseCase } from './usecase.js';
import type { GraphGetByRunPort } from './port.js';

export function makeGraphGetByRunController(deps: { port: GraphGetByRunPort }) {
  const execute = makeGetByRunUseCase({ port: deps.port });

  return async function handler(request: FastifyRequest, reply: FastifyReply) {
    const parsed = GraphGetByRunParamsSchema.safeParse(request.params);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid request' });
    }
    const result = await execute(parsed.data.runId);
    const valid = GraphGetByRunResponseSchema.safeParse(result);
    if (!valid.success) {
      return reply.code(500).send({ error: 'Invalid response shape' });
    }
    return reply.code(200).send(valid.data);
  };
}


