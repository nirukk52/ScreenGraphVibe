import { z } from 'zod';

export const AppLaunchConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  apkPath: z.string(),
  packageName: z.string(),
  appActivity: z.string(),
  appiumServerUrl: z.string(),
  isDefault: z.boolean().optional(),
});

export const AppLaunchConfigListResponseSchema = z.object({
  items: z.array(AppLaunchConfigSchema),
});

export type AppLaunchConfigListResponse = z.infer<typeof AppLaunchConfigListResponseSchema>;


