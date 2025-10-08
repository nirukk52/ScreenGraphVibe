export interface AppLaunchConfigDto {
  id: string;
  name: string;
  apkPath: string;
  packageName: string;
  appActivity: string;
  appiumServerUrl: string;
  isDefault?: boolean;
}

export interface AppLaunchConfigListPort {
  list(): Promise<AppLaunchConfigDto[]>;
}


