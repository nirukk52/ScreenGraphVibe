import type { GraphGetByRunPort, GraphResponseDto } from '../../features/graph/get-by-run/port.js';

export class GraphGetByRunAdapter implements GraphGetByRunPort {
  async getGraphByRun(runId: string): Promise<GraphResponseDto> {
    return {
      runId,
      graph: {
        graphId: `graph-${runId}`,
        appId: 'app-1',
        runId,
        version: 'v1',
        createdAt: new Date(0).toISOString(),
      },
    };
  }
}


