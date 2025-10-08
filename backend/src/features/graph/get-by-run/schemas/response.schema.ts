import { z } from 'zod';

export const GraphSummarySchema = z.object({
  graphId: z.string(),
  appId: z.string(),
  runId: z.string(),
  version: z.string(),
  createdAt: z.string(),
});

export const GraphGetByRunResponseSchema = z.object({
  runId: z.string(),
  graph: GraphSummarySchema,
});

export type GraphGetByRunResponse = z.infer<typeof GraphGetByRunResponseSchema>;


