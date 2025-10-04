export interface HealthCheckResponse {
  status: 'ok' | 'db_down';
  message: string;
  timestamp: string;
  requestId: string;
  region?: string;
  environment?: string;
  services: {
    database: 'healthy' | 'unhealthy';
    redis?: 'healthy' | 'unhealthy';
  };
}

export interface CrawlRequest {
  appId: string;
  platform: 'web' | 'mobile';
  packageName?: string;
  baselineId?: string;
}

export interface CrawlResponse {
  runId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  message: string;
}

export interface StatusResponse {
  runId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  message?: string;
}

export interface GraphResponse {
  runId: string;
  graph: any; // Will be properly typed when we implement the graph structure
  screens: any[];
  actions: any[];
}
