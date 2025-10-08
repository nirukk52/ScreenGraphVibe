import { z } from 'zod';

export const GraphGetByRunParamsSchema = z.object({
  runId: z.string().min(1),
});

export type GraphGetByRunParams = z.infer<typeof GraphGetByRunParamsSchema>;


