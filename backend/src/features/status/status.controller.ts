/**
 * @module features/status/controller
 * @description HTTP controller for status feature. Only handles req/res.
 */
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { StatusService } from './status.service.js';
import { statusResponse } from './status.validators.js';

export function makeStatusController(service: StatusService) {
  return {
    get: async (_req: FastifyRequest, reply: FastifyReply) => {
      const res = await service.getStatus();
      const parsed = statusResponse.parse(res);
      reply.status(200).send(parsed);
    },
  };
}
