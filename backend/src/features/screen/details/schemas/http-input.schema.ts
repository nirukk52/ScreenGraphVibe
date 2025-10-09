import { z } from 'zod';

export const HttpInputSchema = z.object({
  screenName: z.string().min(1),
});
export type HttpInput = z.infer<typeof HttpInputSchema>;


