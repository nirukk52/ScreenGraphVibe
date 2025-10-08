import { logger } from '@screengraph/logging';

export interface LogContext {
  runId?: string;
  jobId?: string;
  userId?: string;
  traceId?: string;
  [key: string]: any;
}

// Health check logging helper - moved from logging module to health feature
export function logHealthCheck(
  status: 'healthy' | 'unhealthy',
  message: string,
  context?: LogContext,
): void {
  if (status === 'healthy') {
    logger.info(`Health check passed: ${message}`, context);
  } else {
    logger.error(`Health check failed: ${message}`, context);
  }
}
