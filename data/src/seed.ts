import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { appLaunchConfigs } from './db/schema.js';
import { DEFAULT_APP_CONFIG } from './config/constants.js';

// Load environment variables
import { config } from 'dotenv';
config({ path: process.cwd() + '/.env' });

const connectionString = process.env.POSTGRES_URL || 'postgresql://localhost:5432/screengraph';
const client = postgres(connectionString);
const db = drizzle(client);

async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // Check if default config already exists
    const existingConfigs = await db.select().from(appLaunchConfigs).where(
      eq(appLaunchConfigs.isDefault, 'true')
    );

    if (existingConfigs.length === 0) {
      // Insert default app launch configuration
      await db.insert(appLaunchConfigs).values({
        name: DEFAULT_APP_CONFIG.CONFIG_NAME,
        apkPath: DEFAULT_APP_CONFIG.APK_PATH,
        packageName: DEFAULT_APP_CONFIG.PACKAGE_NAME,
        appActivity: DEFAULT_APP_CONFIG.APP_ACTIVITY,
        appiumServerUrl: DEFAULT_APP_CONFIG.APPIUM_SERVER_URL,
        isDefault: 'true',
      });

      console.log('✅ Default app launch configuration seeded successfully');
    } else {
      console.log('ℹ️  Default app launch configuration already exists, skipping...');
    }

    console.log('🎉 Database seed completed successfully');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed().catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
}

export { seed };
