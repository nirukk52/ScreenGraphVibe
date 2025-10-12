/**
 * @module FakeAppLaunchConfigAdapter
 * @description In-memory fake adapter for app launch config (mock mode)
 */

import type {
  AppLaunchConfigPort,
  AppLaunchConfigRequest,
  AppLaunchConfigResponse,
} from '../../../ports/data/app-launch-config.port.js';

export class FakeAppLaunchConfigAdapter implements AppLaunchConfigPort {
  private configs: Map<string, AppLaunchConfigResponse> = new Map();
  private idCounter = 1;

  constructor() {
    // Seed with one default config
    const defaultConfig: AppLaunchConfigResponse = {
      id: 'fake-config-1',
      name: 'Default Test App',
      apkPath: '/fake/path/app.apk',
      packageName: 'com.example.testapp',
      appActivity: '.MainActivity',
      appiumServerUrl: 'http://localhost:4723',
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.configs.set(defaultConfig.id, defaultConfig);
  }

  async listAll(): Promise<AppLaunchConfigResponse[]> {
    return Array.from(this.configs.values()).sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
  }

  async getById(id: string): Promise<AppLaunchConfigResponse | null> {
    return this.configs.get(id) || null;
  }

  async create(data: AppLaunchConfigRequest): Promise<AppLaunchConfigResponse> {
    // If setting as default, unset existing defaults
    if (data.isDefault) {
      for (const config of this.configs.values()) {
        config.isDefault = false;
      }
    }

    const newConfig: AppLaunchConfigResponse = {
      id: `fake-config-${this.idCounter++}`,
      ...data,
      isDefault: data.isDefault ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.configs.set(newConfig.id, newConfig);
    return newConfig;
  }

  async update(
    id: string,
    data: Partial<AppLaunchConfigRequest>
  ): Promise<AppLaunchConfigResponse> {
    const existing = this.configs.get(id);
    if (!existing) {
      throw new Error('App launch configuration not found');
    }

    // If setting as default, unset existing defaults
    if (data.isDefault) {
      for (const config of this.configs.values()) {
        config.isDefault = false;
      }
    }

    const updated: AppLaunchConfigResponse = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date(),
      isDefault: data.isDefault ?? existing.isDefault,
    };

    this.configs.set(id, updated);
    return updated;
  }

  async deleteById(id: string): Promise<boolean> {
    return this.configs.delete(id);
  }

  async getDefault(): Promise<AppLaunchConfigResponse | null> {
    for (const config of this.configs.values()) {
      if (config.isDefault) {
        return config;
      }
    }
    return null;
  }

  async setDefault(id: string): Promise<AppLaunchConfigResponse> {
    const config = this.configs.get(id);
    if (!config) {
      throw new Error('App launch configuration not found');
    }

    // Unset existing defaults
    for (const c of this.configs.values()) {
      c.isDefault = false;
    }

    config.isDefault = true;
    config.updatedAt = new Date();
    this.configs.set(id, config);

    return config;
  }
}

