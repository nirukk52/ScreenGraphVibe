import { z } from 'zod';
import { SCREEN_STATUS } from '../../../../shared/constants.js';

export const HttpOutputSchema = z.object({
  deviceID: z.string().min(1),
  screenName: z.string().min(1),
  status: z.literal(SCREEN_STATUS.RECEIVED),
});
export type HttpOutput = z.infer<typeof HttpOutputSchema>;


