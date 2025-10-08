export interface GraphNode {
  id: string;
}

export interface GraphResponseDto {
  runId: string;
  graph: {
    graphId: string;
    appId: string;
    runId: string;
    version: string;
    createdAt: string;
  };
}

export interface GraphGetByRunPort {
  getGraphByRun(runId: string): Promise<GraphResponseDto>;
}


