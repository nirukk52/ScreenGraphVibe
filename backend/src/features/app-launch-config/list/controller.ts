import type { FastifyRequest, FastifyReply } from 'fastify';
import { AppLaunchConfigListRequestSchema } from './schemas/request.schema.js';
import { AppLaunchConfigListResponseSchema } from './schemas/response.schema.js';
import { makeListAppLaunchConfigsUseCase } from './usecase.js';
import type { AppLaunchConfigListPort } from './port.js';

export function makeAppLaunchConfigListController(deps: { port: AppLaunchConfigListPort }) {
  const execute = makeListAppLaunchConfigsUseCase({ port: deps.port });

  return async function handler(request: FastifyRequest, reply: FastifyReply) {
    const parsed = AppLaunchConfigListRequestSchema.safeParse({});
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid request' });
    }
    const items = await execute();
    const valid = AppLaunchConfigListResponseSchema.safeParse({ items });
    if (!valid.success) {
      return reply.code(500).send({ error: 'Invalid response shape' });
    }
    return reply.code(200).send(valid.data);
  };
}


