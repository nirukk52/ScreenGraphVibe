import { z } from 'zod';

export const HealthCheckResponseSchema = z.object({
  status: z.enum(['ok', 'error']),
  requestId: z.string(),
  trace_id: z.string(),
});

export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;


