import { execSync } from 'child_process';
import { getConfig, flyRegions, type FlyRegion } from './config.js';

// Fly.io deployment utilities
export class FlyDeployer {
  private config = getConfig();

  constructor(private appName: string = this.config.FLY_APP_NAME) {}

  // Deploy to all configured regions
  async deployToAllRegions(): Promise<void> {
    console.log(`🚀 Deploying ${this.appName} to Fly.io...`);
    
    for (const region of flyRegions) {
      console.log(`📍 Deploying to region: ${region}`);
      await this.deployToRegion(region);
    }
    
    console.log('✅ Deployment complete!');
  }

  // Deploy to specific region
  async deployToRegion(region: FlyRegion): Promise<void> {
    try {
      const deployCommand = `fly deploy --region ${region} --app ${this.appName}`;
      console.log(`Executing: ${deployCommand}`);
      
      execSync(deployCommand, { 
        stdio: 'inherit',
        env: { 
          ...process.env,
          FLY_REGION: region 
        }
      });
      
      console.log(`✅ Successfully deployed to ${region}`);
    } catch (error) {
      console.error(`❌ Failed to deploy to ${region}:`, error);
      throw error;
    }
  }

  // Check deployment status across regions
  async checkHealth(): Promise<Record<FlyRegion, boolean>> {
    const results: Record<FlyRegion, boolean> = {} as any;
    
    for (const region of flyRegions) {
      try {
        const url = `https://${this.appName}.fly.dev/health`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(url, { 
          signal: controller.signal,
          headers: { 'User-Agent': 'Fly-Health-Check' }
        });
        
        clearTimeout(timeoutId);
        
        results[region] = response.ok;
        console.log(`${region}: ${response.ok ? '✅' : '❌'} (${response.status})`);
      } catch (error) {
        results[region] = false;
        console.log(`${region}: ❌ (${error instanceof Error ? error.message : 'Unknown error'})`);
      }
    }
    
    return results;
  }

  // Get logs from all regions
  getLogs(region?: FlyRegion): string {
    const command = region 
      ? `fly logs --app ${this.appName} --region ${region}`
      : `fly logs --app ${this.appName}`;
    
    try {
      return execSync(command, { encoding: 'utf-8' });
    } catch (error) {
      throw new Error(`Failed to get logs: ${error}`);
    }
  }
}

// Fly.io configuration generator
export function generateFlyConfig(serviceName: string, port: number = 3000) {
  const config = getConfig();
  
  return {
    app: config.FLY_APP_NAME,
    primary_region: 'iad',
    
    [serviceName]: {
      processes: ['app'],
      http_service: {
        internal_port: port,
        force_https: true,
        auto_stop_machines: true,
        auto_start_machines: true,
        min_machines_running: 0,
        concurrency: {
          type: 'connections',
          hard_limit: 1000,
          soft_limit: 1000,
        },
      },
      checks: {
        health: {
          grace_period: '10s',
          interval: '30s',
          method: 'GET',
          timeout: '5s',
          path: '/health',
        },
      },
      env: {
        NODE_ENV: 'production',
        FLY_REGION: '${FLY_REGION}',
        LOG_LEVEL: 'info',
      },
      secrets: [
        'POSTGRES_URL',
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'REDIS_URL',
      ],
    },
  };
}
