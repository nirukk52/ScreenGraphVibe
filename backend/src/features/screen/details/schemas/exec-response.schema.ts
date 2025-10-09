import { z } from 'zod';
import { HttpOutputSchema } from './http-output.schema.js';

export const ExecResponseSchema = z.object({
  data: HttpOutputSchema,
  trace_id: z.string(),
});
export type ExecResponse = z.infer<typeof ExecResponseSchema>;
