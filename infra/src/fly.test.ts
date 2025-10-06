import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FlyDeployer, generateFlyConfig } from '@screengraph/infra/fly.js';
import { getConfig } from '@screengraph/infra/config.js';

// Mock child_process
vi.mock('child_process', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    execSync: vi.fn()
  };
});

// Mock fetch
global.fetch = vi.fn();

// Mock config
vi.mock('@screengraph/infra/config.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getConfig: vi.fn(() => ({
      FLY_APP_NAME: 'screengraph',
      FLY_REGION: 'iad',
      NODE_ENV: 'production'
    }))
  };
});

describe.skip('FlyDeployer', () => {
  let deployer: FlyDeployer;

  beforeEach(() => {
    vi.clearAllMocks();
    deployer = new FlyDeployer();
  });

  it('should create deployer with default app name', () => {
    const defaultDeployer = new FlyDeployer();
    expect(defaultDeployer).toBeDefined();
  });

  it('should create deployer with custom app name', () => {
    const customDeployer = new FlyDeployer('custom-app');
    expect(customDeployer).toBeDefined();
  });

  it('should deploy to specific region', async () => {
    const { execSync } = await import('child_process');
    const mockExecSync = vi.mocked(execSync);
    mockExecSync.mockReturnValue(Buffer.from('Deployment successful')).toString();

    await deployer.deployToRegion('iad');

    expect(mockExecSync).toHaveBeenCalledWith(
      'fly deploy --region iad --app screengraph',
      {
        stdio: 'inherit',
        env: {
          ...process.env,
          FLY_REGION: 'iad'
        }
      }
    );
  });

  it('should handle deployment failure', async () => {
    const { execSync } = await import('child_process');
    const mockExecSync = vi.mocked(execSync);
    mockExecSync.mockImplementation(() => {
      throw new Error('Deployment failed');
    });

    await expect(deployer.deployToRegion('iad')).rejects.toThrow('Deployment failed');
  });

  it('should check health across regions', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200
    } as Response);

    const results = await deployer.checkHealth();

    expect(results).toHaveProperty('iad');
    expect(results).toHaveProperty('dfw');
    expect(results).toHaveProperty('bom');

    // Check that fetch was called for each region
    const expectedCalls = 3; // Number of regions
    expect(mockFetch).toHaveBeenCalledTimes(expectedCalls);
  });

  it('should handle health check failures', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValue(new Error('Network error'));

    const results = await deployer.checkHealth();

    // All regions should show as unhealthy
    Object.values(results).forEach(healthy => {
      expect(healthy).toBe(false);
    });
  });

  it('should get logs for specific region', async () => {
    const { execSync } = await import('child_process');
    const mockExecSync = vi.mocked(execSync);
    mockExecSync.mockReturnValue('Log output for region');

    const logs = deployer.getLogs('iad');

    expect(logs).toBe('Log output for region');
    expect(mockExecSync).toHaveBeenCalledWith(
      'fly logs --app screengraph --region iad',
      { encoding: 'utf-8' }
    );
  });

  it('should get logs for all regions', async () => {
    const { execSync } = await import('child_process');
    const mockExecSync = vi.mocked(execSync);
    mockExecSync.mockReturnValue('Log output for all regions');

    const logs = deployer.getLogs();

    expect(logs).toBe('Log output for all regions');
    expect(mockExecSync).toHaveBeenCalledWith(
      'fly logs --app screengraph',
      { encoding: 'utf-8' }
    );
  });

  it('should handle log retrieval failure', async () => {
    const { execSync } = await import('child_process');
    const mockExecSync = vi.mocked(execSync);
    mockExecSync.mockImplementation(() => {
      throw new Error('Log retrieval failed');
    });

    expect(() => deployer.getLogs()).toThrow('Failed to get logs: Error: Log retrieval failed');
  });
});

describe.skip('Fly Config Generation', () => {
  it('should generate valid fly config', () => {
    const config = generateFlyConfig('agent', 3000);

    expect(config).toEqual({
      app: 'screengraph',
      primary_region: 'iad',
      agent: {
        processes: ['app'],
        http_service: {
          internal_port: 3000,
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
    });
  });

  it('should generate config with custom port', () => {
    const config = generateFlyConfig('ui', 3001);

    expect(config.ui.http_service.internal_port).toBe(3001);
  });

  it('should include all required secrets', () => {
    const config = generateFlyConfig('agent', 3000);

    expect(config.agent.secrets).toContain('POSTGRES_URL');
    expect(config.agent.secrets).toContain('SUPABASE_URL');
    expect(config.agent.secrets).toContain('SUPABASE_ANON_KEY');
    expect(config.agent.secrets).toContain('SUPABASE_SERVICE_ROLE_KEY');
    expect(config.agent.secrets).toContain('REDIS_URL');
  });
});
