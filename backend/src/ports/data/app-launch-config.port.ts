/**
 * @module ports/data/app-launch-config.port
 * @description Backend's data access contract for app launch configuration.
 */
export interface AppLaunchConfigPort {
  getDefault(): Promise<{ packageName: string; mainActivity: string }>;
}
