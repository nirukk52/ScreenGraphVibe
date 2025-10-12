/**
 * @module AppLaunchConfigRepository
 * @description Repository for app launch configuration CRUD operations
 * @publicAPI listAll, getById, create, update, deleteById, getDefault, setDefault
 */

import { eq } from 'drizzle-orm';
import { db } from '../../core/db/client.js';
import { appLaunchConfigs } from './app-launch-config.schema.js';
import type {
  AppLaunchConfig,
  NewAppLaunchConfig,
  AppLaunchConfigResponse,
  AppLaunchConfigRequest,
} from './app-launch-config.types.js';

/**
 * Map database row to response DTO
 */
function mapToResponse(config: AppLaunchConfig): AppLaunchConfigResponse {
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

/**
 * List all app launch configurations
 */
export async function listAll(): Promise<AppLaunchConfigResponse[]> {
  const configs = await db
    .select()
    .from(appLaunchConfigs)
    .orderBy(appLaunchConfigs.createdAt);

  return configs.map(mapToResponse);
}

/**
 * Get app launch configuration by ID
 */
export async function getById(id: string): Promise<AppLaunchConfigResponse | null> {
  const [config] = await db
    .select()
    .from(appLaunchConfigs)
    .where(eq(appLaunchConfigs.id, id));

  return config ? mapToResponse(config) : null;
}

/**
 * Create a new app launch configuration
 */
export async function create(data: AppLaunchConfigRequest): Promise<AppLaunchConfigResponse> {
  // If setting as default, unset existing defaults
  if (data.isDefault) {
    await db
      .update(appLaunchConfigs)
      .set({ isDefault: 'false' })
      .where(eq(appLaunchConfigs.isDefault, 'true'));
  }

  const [newConfig] = await db
    .insert(appLaunchConfigs)
    .values({
      name: data.name,
      apkPath: data.apkPath,
      packageName: data.packageName,
      appActivity: data.appActivity,
      appiumServerUrl: data.appiumServerUrl,
      isDefault: data.isDefault ? 'true' : 'false',
    })
    .returning();

  return mapToResponse(newConfig);
}

/**
 * Update app launch configuration by ID
 */
export async function update(
  id: string,
  data: Partial<AppLaunchConfigRequest>
): Promise<AppLaunchConfigResponse> {
  // If setting as default, unset existing defaults
  if (data.isDefault) {
    await db
      .update(appLaunchConfigs)
      .set({ isDefault: 'false' })
      .where(eq(appLaunchConfigs.isDefault, 'true'));
  }

  const updateData: Partial<NewAppLaunchConfig> = {
    updatedAt: new Date(),
  };

  if (data.name !== undefined) updateData.name = data.name;
  if (data.apkPath !== undefined) updateData.apkPath = data.apkPath;
  if (data.packageName !== undefined) updateData.packageName = data.packageName;
  if (data.appActivity !== undefined) updateData.appActivity = data.appActivity;
  if (data.appiumServerUrl !== undefined) updateData.appiumServerUrl = data.appiumServerUrl;
  if (data.isDefault !== undefined) updateData.isDefault = data.isDefault ? 'true' : 'false';

  const [updatedConfig] = await db
    .update(appLaunchConfigs)
    .set(updateData)
    .where(eq(appLaunchConfigs.id, id))
    .returning();

  if (!updatedConfig) {
    throw new Error('App launch configuration not found');
  }

  return mapToResponse(updatedConfig);
}

/**
 * Delete app launch configuration by ID
 */
export async function deleteById(id: string): Promise<boolean> {
  const result = await db.delete(appLaunchConfigs).where(eq(appLaunchConfigs.id, id));
  return result.length > 0;
}

/**
 * Get the default app launch configuration
 */
export async function getDefault(): Promise<AppLaunchConfigResponse | null> {
  const [config] = await db
    .select()
    .from(appLaunchConfigs)
    .where(eq(appLaunchConfigs.isDefault, 'true'));

  return config ? mapToResponse(config) : null;
}

/**
 * Set app launch configuration as default by ID
 */
export async function setDefault(id: string): Promise<AppLaunchConfigResponse> {
  // Unset existing defaults
  await db
    .update(appLaunchConfigs)
    .set({ isDefault: 'false' })
    .where(eq(appLaunchConfigs.isDefault, 'true'));

  // Set new default
  const [updatedConfig] = await db
    .update(appLaunchConfigs)
    .set({
      isDefault: 'true',
      updatedAt: new Date(),
    })
    .where(eq(appLaunchConfigs.id, id))
    .returning();

  if (!updatedConfig) {
    throw new Error('App launch configuration not found');
  }

  return mapToResponse(updatedConfig);
}
