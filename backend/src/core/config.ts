/**
 * @module core/config
 * @description Derived configuration values computed from env and shared constants.
 * @publicAPI getConfig
 */
import { getEnv } from './env.js';

export interface AppConfig {
  port: number;
  host: string;
  requestTimeoutMs: number;
  bodyLimitBytes: number;
}

let cached: AppConfig | undefined;
export function getConfig(): AppConfig {
  if (cached) return cached;
  const env = getEnv();
  cached = {
    port: env.PORT,
    host: '0.0.0.0',
    requestTimeoutMs: 30_000,
    bodyLimitBytes: 1_048_576,
  };
  return cached;
}
