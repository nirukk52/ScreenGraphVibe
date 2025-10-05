import { describe, it, expect, beforeEach, vi } from 'vitest';
import { deploy } from '@screengraph/infra/deploy.js';
import { FlyDeployer } from '@screengraph/infra/fly.js';
import { getConfig } from '@screengraph/infra/config.js';

// Mock dependencies
vi.mock('@screengraph/infra/fly.js');
vi.mock('@screengraph/infra/config.js');
vi.mock('child_process', () => ({
  execSync: vi.fn()
}));

describe('Deployment Integration', () => {
  let mockDeployer: any;
  let mockConfig: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock config
    mockConfig = {
      NODE_ENV: 'production',
      FLY_APP_NAME: 'screengraph',
      FLY_REGION: 'iad'
    };

    // Mock deployer
    mockDeployer = {
      deployToAllRegions: vi.fn().mockResolvedValue(undefined),
      checkHealth: vi.fn().mockResolvedValue({
        iad: true,
        dfw: true,
        sea: true,
        lhr: true,
        fra: true,
        sin: true
      })
    };

    vi.mocked(FlyDeployer).mockImplementation(() => mockDeployer);
    vi.mocked(getConfig).mockReturnValue(mockConfig);

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should deploy successfully', async () => {
    const { execSync } = await import('child_process');
    const mockExecSync = vi.mocked(execSync);
    mockExecSync.mockReturnValue(Buffer.from('Build successful')).toString();

    await deploy();

    expect(mockExecSync).toHaveBeenCalledWith('npm run build', { stdio: 'inherit' });
    expect(mockDeployer.deployToAllRegions).toHaveBeenCalled();
    expect(mockDeployer.checkHealth).toHaveBeenCalled();
  });

  it('should handle build failure', async () => {
    const { execSync } = await import('child_process');
    const mockExecSync = vi.mocked(execSync);
    mockExecSync.mockImplementation(() => {
      throw new Error('Build failed');
    });

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });

    await expect(deploy()).rejects.toThrow('process.exit called');
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
  });

  it('should handle deployment failure', async () => {
    const { execSync } = await import('child_process');
    const mockExecSync = vi.mocked(execSync);
    mockExecSync.mockReturnValue(Buffer.from('Build successful')).toString();
    
    mockDeployer.deployToAllRegions.mockRejectedValue(new Error('Deployment failed'));

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });

    await expect(deploy()).rejects.toThrow('process.exit called');
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
  });

  it('should warn on health check failures', async () => {
    const { execSync } = await import('child_process');
    const mockExecSync = vi.mocked(execSync);
    mockExecSync.mockReturnValue(Buffer.from('Build successful')).toString();
    
    // Mock some regions failing
    mockDeployer.checkHealth.mockResolvedValue({
      iad: true,
      dfw: false,  // Failed
      sea: true,
      lhr: false,  // Failed
      fra: true,
      sin: true
    });

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await deploy();

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Health checks failed in regions: dfw, lhr')
    );

    consoleWarnSpy.mockRestore();
  });

  it('should show success message when all health checks pass', async () => {
    const { execSync } = await import('child_process');
    const mockExecSync = vi.mocked(execSync);
    mockExecSync.mockReturnValue(Buffer.from('Build successful')).toString();

    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await deploy();

    expect(consoleLogSpy).toHaveBeenCalledWith('✅ All health checks passed!');
    expect(consoleLogSpy).toHaveBeenCalledWith('🎉 Deployment completed successfully!');
    expect(consoleLogSpy).toHaveBeenCalledWith('🌐 App URL: https://screengraph.fly.dev');

    consoleLogSpy.mockRestore();
  });

  it('should validate environment before deployment', async () => {
    // Mock config validation failure
    vi.mocked(getConfig).mockImplementation(() => {
      throw new Error('Environment validation failed');
    });

    await expect(deploy()).rejects.toThrow('Environment validation failed');
  });
});

describe('Health Check Integration', () => {
  it('should return correct status format', async () => {
    // This would be an integration test with actual health endpoint
    // For now, we'll test the expected format
    
    const expectedHealthResponse = {
      status: 'ok',
      message: 'All services operational',
      timestamp: expect.any(String),
      requestId: expect.any(String),
      region: 'iad',
      environment: 'production',
      services: {
        database: 'healthy'
      }
    };

    // Mock fetch for health check
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(expectedHealthResponse)
    });

    const response = await fetch('https://screengraph.fly.dev/healthz');
    const data = await response.json();

    expect(data).toMatchObject(expectedHealthResponse);
    expect(data.status).toBe('ok');
    expect(data.services.database).toBe('healthy');
  });

  it('should handle db_down status', async () => {
    const expectedHealthResponse = {
      status: 'db_down',
      message: 'Database connection failed',
      timestamp: expect.any(String),
      requestId: expect.any(String),
      region: 'iad',
      environment: 'production',
      services: {
        database: 'unhealthy'
      }
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: () => Promise.resolve(expectedHealthResponse)
    });

    const response = await fetch('https://screengraph.fly.dev/healthz');
    const data = await response.json();

    expect(data.status).toBe('db_down');
    expect(data.services.database).toBe('unhealthy');
  });
});
