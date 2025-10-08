import type { HealthCheckPort, HealthCheckResult } from './port.js';

export function makeHealthCheckUseCase(deps: { port: HealthCheckPort }) {
  return async function execute(): Promise<HealthCheckResult> {
    return deps.port.check();
  };
}


