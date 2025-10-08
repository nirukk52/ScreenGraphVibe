/**
 * @module features/health/check/port
 * @description Feature-scoped port for health check use case.
 */

export type HealthStatus = 'ok' | 'error';

export interface HealthCheckResult {
  status: HealthStatus;
  requestId: string;
}

export interface HealthCheckPort {
  check(): Promise<HealthCheckResult>;
}


