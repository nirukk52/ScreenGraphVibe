// Route wiring
import type { FastifyInstance } from 'fastify';
import { makeController } from './controller.js';
import type { ScreenDetailsPort } from './port.js';
import { ROUTES } from '../../../shared/constants.js';

export async function registerScreenDetailsRoute(app: FastifyInstance, deps: { port: ScreenDetailsPort }) {
  app.post(ROUTES.SCREEN_DETAILS, makeController(deps));
}
