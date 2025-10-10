/**
 * @module features/graph/events/di
 * @description Selects graph event publisher via env RUN_MODE=mock|real.
 */
import type { GraphEventPublisherPort } from './port.js';
import { makeMockGraphEventPublisher } from './adapters/fake.adapter.js';

export function makeGraphEventPublisherFromEnv(): GraphEventPublisherPort {
  const mode = (process.env.RUN_MODE || 'mock').toLowerCase();
  switch (mode) {
    case 'real':
      // TODO: plug real adapter; fallback to mock until implemented
      return makeMockGraphEventPublisher();
    case 'mock':
    default:
      return makeMockGraphEventPublisher();
  }
}


