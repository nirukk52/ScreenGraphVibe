/**
 * @module shared/schemas/error
 * @description Shared Zod schema for standardized error responses.
 */
import { z } from '../zod.js';

export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  trace_id: z.string().optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;


