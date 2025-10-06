import { eq, and } from 'drizzle-orm';
import { db } from '@screengraph/data';
import { appLaunchConfigs } from '@screengraph/data';
import type { 
  AppLaunchConfigService, 
  AppLaunchConfigResponse, 
  AppLaunchConfigRequest,
  ApiResponse 
} from './types.js';

export class AppLaunchConfigServiceImpl implements AppLaunchConfigService {
  async getAllConfigs(): Promise<AppLaunchConfigResponse[]> {
    try {
      const configs = await db.select().from(appLaunchConfigs).orderBy(appLaunchConfigs.createdAt);
      
      return configs.map(this.mapToResponse);
    } catch (error) {
      console.error('Error fetching app launch configs:', error);
      throw new Error('Failed to fetch app launch configurations');
    }
  }

  async getConfigById(id: string): Promise<AppLaunchConfigResponse | null> {
    try {
      const [config] = await db.select().from(appLaunchConfigs).where(eq(appLaunchConfigs.id, id));
      
      return config ? this.mapToResponse(config) : null;
    } catch (error) {
      console.error('Error fetching app launch config by id:', error);
      throw new Error('Failed to fetch app launch configuration');
    }
  }

  async createConfig(config: AppLaunchConfigRequest): Promise<AppLaunchConfigResponse> {
    try {
      // If this is being set as default, unset any existing default
      if (config.isDefault) {
        await db.update(appLaunchConfigs)
          .set({ isDefault: 'false' })
          .where(eq(appLaunchConfigs.isDefault, 'true'));
      }

      const [newConfig] = await db.insert(appLaunchConfigs).values({
        name: config.name,
        apkPath: config.apkPath,
        packageName: config.packageName,
        appActivity: config.appActivity,
        appiumServerUrl: config.appiumServerUrl,
        isDefault: config.isDefault ? 'true' : 'false',
      }).returning();

      return this.mapToResponse(newConfig);
    } catch (error) {
      console.error('Error creating app launch config:', error);
      throw new Error('Failed to create app launch configuration');
    }
  }

  async updateConfig(id: string, config: Partial<AppLaunchConfigRequest>): Promise<AppLaunchConfigResponse> {
    try {
      // If this is being set as default, unset any existing default
      if (config.isDefault) {
        await db.update(appLaunchConfigs)
          .set({ isDefault: 'false' })
          .where(eq(appLaunchConfigs.isDefault, 'true'));
      }

      const updateData: any = {
        updatedAt: new Date(),
      };

      if (config.name !== undefined) updateData.name = config.name;
      if (config.apkPath !== undefined) updateData.apkPath = config.apkPath;
      if (config.packageName !== undefined) updateData.packageName = config.packageName;
      if (config.appActivity !== undefined) updateData.appActivity = config.appActivity;
      if (config.appiumServerUrl !== undefined) updateData.appiumServerUrl = config.appiumServerUrl;
      if (config.isDefault !== undefined) updateData.isDefault = config.isDefault ? 'true' : 'false';

      const [updatedConfig] = await db.update(appLaunchConfigs)
        .set(updateData)
        .where(eq(appLaunchConfigs.id, id))
        .returning();

      if (!updatedConfig) {
        throw new Error('App launch configuration not found');
      }

      return this.mapToResponse(updatedConfig);
    } catch (error) {
      console.error('Error updating app launch config:', error);
      throw new Error('Failed to update app launch configuration');
    }
  }

  async deleteConfig(id: string): Promise<boolean> {
    try {
      const result = await db.delete(appLaunchConfigs).where(eq(appLaunchConfigs.id, id));
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting app launch config:', error);
      throw new Error('Failed to delete app launch configuration');
    }
  }

  async getDefaultConfig(): Promise<AppLaunchConfigResponse | null> {
    try {
      const [config] = await db.select()
        .from(appLaunchConfigs)
        .where(eq(appLaunchConfigs.isDefault, 'true'));

      return config ? this.mapToResponse(config) : null;
    } catch (error) {
      console.error('Error fetching default app launch config:', error);
      throw new Error('Failed to fetch default app launch configuration');
    }
  }

  async setDefaultConfig(id: string): Promise<AppLaunchConfigResponse> {
    try {
      // First unset any existing default
      await db.update(appLaunchConfigs)
        .set({ isDefault: 'false' })
        .where(eq(appLaunchConfigs.isDefault, 'true'));

      // Set the new default
      const [updatedConfig] = await db.update(appLaunchConfigs)
        .set({ 
          isDefault: 'true',
          updatedAt: new Date()
        })
        .where(eq(appLaunchConfigs.id, id))
        .returning();

      if (!updatedConfig) {
        throw new Error('App launch configuration not found');
      }

      return this.mapToResponse(updatedConfig);
    } catch (error) {
      console.error('Error setting default app launch config:', error);
      throw new Error('Failed to set default app launch configuration');
    }
  }

  private mapToResponse(config: any): AppLaunchConfigResponse {
    return {
      id: config.id,
      name: config.name,
      apkPath: config.apkPath,
      packageName: config.packageName,
      appActivity: config.appActivity,
      appiumServerUrl: config.appiumServerUrl,
      isDefault: config.isDefault === 'true',
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }
}

// Export singleton instance
export const appLaunchConfigService = new AppLaunchConfigServiceImpl();
