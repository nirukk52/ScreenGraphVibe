/**
 * @module AppLaunchConfigAdapter
 * @description Real adapter calling @screengraph/data repository (public API only)
 */

import { AppLaunchConfigRepo } from '@screengraph/data';
import type {
  AppLaunchConfigPort,
  AppLaunchConfigRequest,
  AppLaunchConfigResponse,
} from '../../ports/data/app-launch-config.port.js';

export class AppLaunchConfigAdapter implements AppLaunchConfigPort {
  async listAll(): Promise<AppLaunchConfigResponse[]> {
    return AppLaunchConfigRepo.listAll();
  }

  async getById(id: string): Promise<AppLaunchConfigResponse | null> {
    return AppLaunchConfigRepo.getById(id);
  }

  async create(data: AppLaunchConfigRequest): Promise<AppLaunchConfigResponse> {
    return AppLaunchConfigRepo.create(data);
  }

  async update(
    id: string,
    data: Partial<AppLaunchConfigRequest>
  ): Promise<AppLaunchConfigResponse> {
    return AppLaunchConfigRepo.update(id, data);
  }

  async deleteById(id: string): Promise<boolean> {
    return AppLaunchConfigRepo.deleteById(id);
  }

  async getDefault(): Promise<AppLaunchConfigResponse | null> {
    return AppLaunchConfigRepo.getDefault();
  }

  async setDefault(id: string): Promise<AppLaunchConfigResponse> {
    return AppLaunchConfigRepo.setDefault(id);
  }
}
