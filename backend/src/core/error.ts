/**
 * @module core/error
 * @description Typed error mapping to HTTP responses; sets Fastify error handler.
 */
import type { FastifyInstance } from 'fastify';

export class BaseError extends Error {
  constructor(public readonly code: string, message?: string) {
    super(message ?? code);
  }
}

export class ValidationError extends BaseError {
  constructor(public readonly details: unknown) {
    super('validation_error', 'Validation failed');
  }
}

export class NotFoundError extends BaseError {
  constructor(resource = 'resource') {
    super('not_found', `${resource} not found`);
  }
}

export class UnauthorizedError extends BaseError {
  constructor() {
    super('unauthorized', 'Unauthorized');
  }
}

export function setErrorHandling(app: FastifyInstance) {
  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof ValidationError) {
      reply.status(400).send({ error: 'validation_error', details: err.details });
      return;
    }
    if (err instanceof UnauthorizedError) {
      reply.status(401).send({ error: 'unauthorized' });
      return;
    }
    if (err instanceof NotFoundError) {
      reply.status(404).send({ error: 'not_found' });
      return;
    }
    if (err instanceof BaseError) {
      reply.status(422).send({ error: err.code });
      return;
    }
    reply.status(500).send({ error: 'internal_error' });
  });
}


