/**
 * @module shared/schemas/response
 * @description Zod schemas for standardized API envelopes.
 */
import { z } from '../zod.js';

export const ApiErrorSchema = z.object({
  code: z.string(),
  error: z.string(),
  message: z.string().optional(),
  type: z.string().optional(),
  fallbackRoute: z.string().optional(),
});

export const ApiErrorEnvelopeSchema = z.object({
  ok: z.literal(false),
  error: ApiErrorSchema,
  trace_id: z.string().optional(),
});

export function makeApiSuccessEnvelopeSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    ok: z.literal(true),
    data: dataSchema,
    trace_id: z.string().optional(),
  });
}


