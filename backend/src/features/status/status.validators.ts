/**
 * @module features/status/validators
 * @description Zod schemas for status feature.
 */
import { z } from '../../shared/zod.js';

export const statusResponse = z.object({
  ok: z.literal(true),
  service: z.literal('backend'),
  timestamp: z.string(),
});

export type StatusResponse = z.infer<typeof statusResponse>;
