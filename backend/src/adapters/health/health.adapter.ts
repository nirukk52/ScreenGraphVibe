import type { HealthCheckPort, HealthCheckResult } from '../../features/health/check/port.js';

export class HealthAdapter implements HealthCheckPort {
  async check(): Promise<HealthCheckResult> {
    return { status: 'ok', requestId: 'real-adapter' };
  }
}


