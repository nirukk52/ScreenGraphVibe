import { z } from 'zod';
import { SCREEN_EVENTS } from '../../../../shared/constants.js';

export const SseEventSchema = z.object({
  type: z.literal(SCREEN_EVENTS.DETAILS_RECEIVED),
  data: z.object({
    deviceID: z.string().min(1),
    message: z.string().min(1),
  }),
});
export type SseEvent = z.infer<typeof SseEventSchema>;


