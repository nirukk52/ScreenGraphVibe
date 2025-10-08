import type { AppLaunchConfigListPort, AppLaunchConfigDto } from '../../features/app-launch-config/list/port.js';

export class AppLaunchConfigListAdapter implements AppLaunchConfigListPort {
  async list(): Promise<AppLaunchConfigDto[]> {
    return [];
  }
}


