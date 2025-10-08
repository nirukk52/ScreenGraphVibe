/**
 * @module features/status/service
 * @description Business logic for status feature.
 */
import type { ClockPort } from './status.port.js';
import type { StatusResponse } from './status.types.js';

export class StatusService {
  constructor(private readonly clock: ClockPort) {}

  async getStatus(): Promise<StatusResponse> {
    return {
      ok: true,
      service: 'backend',
      timestamp: this.clock.nowIso(),
    } as const;
  }
}


