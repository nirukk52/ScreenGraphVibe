import { z } from 'zod';

// Health check has no params/body; keep for symmetry
export const HealthCheckRequestSchema = z.object({});

export type HealthCheckRequest = z.infer<typeof HealthCheckRequestSchema>;


