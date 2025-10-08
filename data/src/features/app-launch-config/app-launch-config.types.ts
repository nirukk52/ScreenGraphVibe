import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { appLaunchConfigs } from './app-launch-config.schema.js';

// Types for AppLaunchConfig
export type AppLaunchConfig = InferSelectModel<typeof appLaunchConfigs>;
export type NewAppLaunchConfig = InferInsertModel<typeof appLaunchConfigs>;

// Request/Response types for API
export interface AppLaunchConfigRequest {
  name: string;
  apkPath: string;
  packageName: string;
  appActivity: string;
  appiumServerUrl: string;
  isDefault?: boolean;
}

export interface AppLaunchConfigResponse {
  id: string;
  name: string;
  apkPath: string;
  packageName: string;
  appActivity: string;
  appiumServerUrl: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppLaunchConfigListResponse {
  configs: AppLaunchConfigResponse[];
  total: number;
}

// Validation schemas
export const APP_LAUNCH_CONFIG_FIELDS = {
  NAME: 'name',
  APK_PATH: 'apkPath',
  PACKAGE_NAME: 'packageName',
  APP_ACTIVITY: 'appActivity',
  APPIUM_SERVER_URL: 'appiumServerUrl',
  IS_DEFAULT: 'isDefault',
} as const;

export const REQUIRED_FIELDS = [
  APP_LAUNCH_CONFIG_FIELDS.NAME,
  APP_LAUNCH_CONFIG_FIELDS.APK_PATH,
  APP_LAUNCH_CONFIG_FIELDS.PACKAGE_NAME,
  APP_LAUNCH_CONFIG_FIELDS.APP_ACTIVITY,
  APP_LAUNCH_CONFIG_FIELDS.APPIUM_SERVER_URL,
] as const;


