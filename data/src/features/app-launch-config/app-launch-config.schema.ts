import { pgTable, uuid, timestamp, text } from 'drizzle-orm/pg-core';

export const appLaunchConfigs = pgTable('app_launch_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  apkPath: text('apk_path').notNull(),
  packageName: text('package_name').notNull(),
  appActivity: text('app_activity').notNull(),
  appiumServerUrl: text('appium_server_url').notNull(),
  isDefault: text('is_default').notNull().default('false'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
