import type { GraphGetByRunPort, GraphResponseDto } from '../port.js';

export class FakeGraphGetByRunAdapter implements GraphGetByRunPort {
  async getGraphByRun(runId: string): Promise<GraphResponseDto> {
    return {
      runId,
      graph: {
        graphId: 'graph-1',
        appId: 'app-1',
        runId,
        version: 'v1',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    };
  }
}


