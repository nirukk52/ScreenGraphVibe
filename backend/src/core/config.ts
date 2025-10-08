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

export function getMockedFeatureSet(list?: string) {
  const items = (list ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const features = new Set<string>();
  const subFeatures = new Set<string>();
  for (const it of items) {
    if (it.includes('/')) subFeatures.add(it);
    else features.add(it);
  }
  return { features, subFeatures };
}

export function isMocked(
  sets: { features: Set<string>; subFeatures: Set<string> },
  feature: string,
  sub?: string,
): boolean {
  if (sub && sets.subFeatures.has(`${feature}/${sub}`)) return true;
  if (sets.features.has(feature)) return true;
  return false;
}
