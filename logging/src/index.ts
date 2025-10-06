import pino from 'pino';

export interface LogContext {
  runId?: string;
  jobId?: string;
  userId?: string;
  traceId?: string;
  [key: string]: any;
}

export class Logger {
  private pino: pino.Logger;

  constructor(options: pino.LoggerOptions = {}) {
    this.pino = pino({
      level: process.env.LOG_LEVEL || 'info',
      transport: process.env.NODE_ENV === 'development' ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      } : undefined,
      ...options,
    });
  }

  info(message: string, context?: LogContext): void {
    this.pino.info(context, message);
  }

  warn(message: string, context?: LogContext): void {
    this.pino.warn(context, message);
  }

  error(message: string, context?: LogContext): void {
    this.pino.error(context, message);
  }

  debug(message: string, context?: LogContext): void {
    this.pino.debug(context, message);
  }

  child(context: LogContext): Logger {
    const childLogger = this.pino.child(context);
    return new Logger();
  }
}

// Default logger instance
export const logger = new Logger();

// Note: logHealthCheck has been moved to the health feature module
// to keep the logging module focused on pure logging functionality

export default logger;
