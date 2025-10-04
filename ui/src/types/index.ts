export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  message: string;
  timestamp: string;
  requestId: string;
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
