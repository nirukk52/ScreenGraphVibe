/**
 * @module adapters/data/health.adapter
 * @description Implements HealthDataPort using @screengraph/data.
 */
import type { HealthDataPort } from '../../ports/data/health.port.js';

export function makeHealthDataAdapter(): HealthDataPort {
  return {
    async ping() {
      // Placeholder: call into @screengraph/data health repo/queries
      return { ok: true } as const;
    },
  };
}
