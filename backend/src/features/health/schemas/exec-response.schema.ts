import { z } from 'zod';

export const HealthExecResponseSchema = z.object({
  feature: z.literal('health'),
  trace_id: z.string(),
});

export type HealthExecResponse = z.infer<typeof HealthExecResponseSchema>;


