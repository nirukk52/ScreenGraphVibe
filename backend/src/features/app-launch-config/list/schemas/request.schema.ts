import { z } from 'zod';

export const AppLaunchConfigListRequestSchema = z.object({});
export type AppLaunchConfigListRequest = z.infer<typeof AppLaunchConfigListRequestSchema>;


