/**
 * @module AppLaunchConfigPort
 * @description Port (interface) for app launch configuration data access
 */

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

export interface AppLaunchConfigPort {
  listAll(): Promise<AppLaunchConfigResponse[]>;
  getById(id: string): Promise<AppLaunchConfigResponse | null>;
  create(data: AppLaunchConfigRequest): Promise<AppLaunchConfigResponse>;
  update(id: string, data: Partial<AppLaunchConfigRequest>): Promise<AppLaunchConfigResponse>;
  deleteById(id: string): Promise<boolean>;
  getDefault(): Promise<AppLaunchConfigResponse | null>;
  setDefault(id: string): Promise<AppLaunchConfigResponse>;
}
