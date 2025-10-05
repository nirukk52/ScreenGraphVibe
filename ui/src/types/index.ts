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

export interface HealthStatus {
  isHealthy: boolean;
  message: string;
  lastChecked: string;
  requestId?: string;
  services: {
    database: boolean;
    redis?: boolean;
  };
}
