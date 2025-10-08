/**
 * @module ports/data/health.port
 * @description Backend's data access contract for health checks.
 */
export interface HealthDataPort {
  ping(): Promise<{ ok: true }>;
}
