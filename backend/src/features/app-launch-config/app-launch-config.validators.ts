/**
 * @module features/app-launch-config/validators
 * @description Zod schemas for request/response. Intentionally commented-out to preserve current runtime.
 *              Use these to migrate validation from inline schemas in routes.ts to a dedicated layer.
 */

// import { z } from '../../shared/zod.js';
// import type { AppLaunchConfigRequest, AppLaunchConfigResponse } from './types.js';

// export const appLaunchConfigRequest = z.object({
//   name: z.string().min(1),
//   apkPath: z.string().min(1),
//   packageName: z.string().min(1),
//   appActivity: z.string().min(1),
//   appiumServerUrl: z.string().url(),
//   isDefault: z.boolean().optional(),
// });
// export type AppLaunchConfigRequestValidated = z.infer<typeof appLaunchConfigRequest>;

// export const appLaunchConfigResponse = z.object({
//   id: z.string(),
//   name: z.string(),
//   apkPath: z.string(),
//   packageName: z.string(),
//   appActivity: z.string(),
//   appiumServerUrl: z.string().url(),
//   isDefault: z.boolean(),
//   createdAt: z.any(),
//   updatedAt: z.any(),
// });
// export type AppLaunchConfigResponseValidated = z.infer<typeof appLaunchConfigResponse>;

// export function createResponse<T>(success: boolean, data?: T, error?: string, message?: string) {
//   return { success, data, error, message } as const;
// }
