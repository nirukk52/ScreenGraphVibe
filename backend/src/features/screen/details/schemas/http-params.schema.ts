import { z } from 'zod';

export const HttpParamsSchema = z.object({
  deviceID: z.string().min(1),
});
export type HttpParams = z.infer<typeof HttpParamsSchema>;


