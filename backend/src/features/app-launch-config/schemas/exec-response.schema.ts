import { z } from 'zod';

export const AppLaunchConfigExecResponseSchema = z.object({
  feature: z.literal('app-launch-config'),
  trace_id: z.string(),
});

export type AppLaunchConfigExecResponse = z.infer<typeof AppLaunchConfigExecResponseSchema>;


