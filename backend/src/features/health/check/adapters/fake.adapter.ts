import type { HealthCheckPort, HealthCheckResult } from '../port.js';

export class FakeHealthCheckAdapter implements HealthCheckPort {
  async check(): Promise<HealthCheckResult> {
    return { status: 'ok', requestId: 'fake-request-id' };
  }
}


