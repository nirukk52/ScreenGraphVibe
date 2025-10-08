/**
 * @module core/env
 * @description Zod-validated environment variables for :backend. Single source of truth.
 * @publicAPI getEnv
 */
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z
    .string()
    .default('3000')
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().int().positive()),
  AGENT_HOST: z.string().default('0.0.0.0'),
  AGENT_PORT: z
    .string()
    .default('3000')
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().int().positive()),
  // Comma-separated list of mocked features and/or sub-features, e.g. "app-launch-config,list,health/check"
  MOCK_FEATURES: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

let cached: Env | undefined;
export function getEnv(): Env {
  if (cached) return cached;
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error('Invalid environment configuration');
  }
  cached = parsed.data;
  return cached;
}
