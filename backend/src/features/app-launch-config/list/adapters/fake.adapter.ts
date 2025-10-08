import type { AppLaunchConfigListPort, AppLaunchConfigDto } from '../port.js';

export class FakeAppLaunchConfigListAdapter implements AppLaunchConfigListPort {
  async list(): Promise<AppLaunchConfigDto[]> {
    return [
      {
        id: 'cfg-1',
        name: 'Default Config',
        apkPath: '/path/to/app.apk',
        packageName: 'com.example.app',
        appActivity: 'com.example.app.MainActivity',
        appiumServerUrl: 'http://localhost:4723',
        isDefault: true,
      },
    ];
  }
}


