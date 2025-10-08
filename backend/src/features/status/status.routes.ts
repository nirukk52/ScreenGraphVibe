/**
 * @module features/status/routes
 * @description Fastify route registrations for status feature.
 */
import type { FastifyInstance } from 'fastify';
import { makeStatusController } from './status.controller.js';
import { StatusService } from './status.service.js';
import { statusResponse } from './status.validators.js';
import { nowIso } from '../../shared/utils/time.js';
import { ROUTES } from '../../shared/constants.js';

export async function statusRoutes(app: FastifyInstance) {
  const service = new StatusService({ nowIso });
  const controller = makeStatusController(service);

  app.get(ROUTES.STATUS, {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { const: true },
            service: { const: 'backend' },
            timestamp: { type: 'string' },
          },
          required: ['ok', 'service', 'timestamp'],
        },
      },
    },
  }, controller.get);
}


