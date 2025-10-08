/**
 * @module adapters/data/app-launch-config.adapter
 * @description Implements AppLaunchConfigPort using @screengraph/data.
 */
import type { AppLaunchConfigPort } from '../../ports/data/app-launch-config.port.js';

export function makeAppLaunchConfigAdapter(): AppLaunchConfigPort {
  return {
    async getDefault() {
      // Placeholder: replace with call to @screengraph/data feature
      return { packageName: 'com.example.app', mainActivity: 'MainActivity' };
    },
  };
}
