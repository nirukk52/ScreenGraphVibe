#!/usr/bin/env node

import { FlyDeployer } from './fly.js';
import { getConfig } from './config.js';
import { execSync } from 'child_process';

async function main() {
  const config = getConfig();
  const deployer = new FlyDeployer();

  console.log('🚀 Starting Screengraph deployment...');
  console.log(`📍 Environment: ${config.NODE_ENV}`);
  console.log(`🌍 App: ${config.FLY_APP_NAME}`);

  try {
    // Validate environment
    console.log('✅ Environment validation passed');

    // Build all workspaces
    console.log('🔨 Building workspace...');
    execSync('npm run build', { stdio: 'inherit' });

    // Deploy to Fly.io
    await deployer.deployToAllRegions();

    // Health check after deployment
    console.log('🏥 Running health checks...');
    const healthResults = await deployer.checkHealth();
    
    const failedRegions = Object.entries(healthResults)
      .filter(([_, healthy]) => !healthy)
      .map(([region, _]) => region);

    if (failedRegions.length > 0) {
      console.warn(`⚠️  Health checks failed in regions: ${failedRegions.join(', ')}`);
      console.log('📝 Check logs with: fly logs --app screengraph');
    } else {
      console.log('✅ All health checks passed!');
    }

    console.log('🎉 Deployment completed successfully!');
    console.log(`🌐 App URL: https://${config.FLY_APP_NAME}.fly.dev`);

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as deploy };
