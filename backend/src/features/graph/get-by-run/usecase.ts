import type { GraphGetByRunPort } from './port.js';

export function makeGetByRunUseCase(deps: { port: GraphGetByRunPort }) {
  return async function execute(runId: string) {
    return deps.port.getGraphByRun(runId);
  };
}


