import { z } from 'zod';
export const ExecRequestSchema = z.object({});
export type ExecRequest = z.infer<typeof ExecRequestSchema>;
