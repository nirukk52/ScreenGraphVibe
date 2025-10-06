import { describe, it, expect, beforeEach, vi } from 'vitest';
import { envSchema, getConfig, flyRegions } from '@screengraph/infra/config.js';

// Mock dotenv
vi.mock('dotenv', () => ({
  config: vi.fn(),
}));

describe('Config Validation', () => {
  beforeEach(() => {
    // Reset process.env for each test
    delete process.env.POSTGRES_URL;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.REDIS_URL;
    delete process.env.AGENT_PORT;
    delete process.env.AGENT_HOST;
    delete process.env.NEXT_PUBLIC_AGENT_URL;
    delete process.env.LOG_LEVEL;
    delete process.env.NODE_ENV;
    delete process.env.FLY_APP_NAME;
    delete process.env.STORAGE_BUCKET;
  });

  it('should validate required environment variables', () => {
    const validEnv = {
      POSTGRES_URL: 'postgresql://localhost:5432/test',
      SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
      REDIS_URL: 'redis://localhost:6379',
      NEXT_PUBLIC_AGENT_URL: 'http://localhost:3000',
    };

    const result = envSchema.safeParse(validEnv);
    expect(result.success).toBe(true);
  });

  it('should fail on missing required variables', () => {
    const invalidEnv = {
      POSTGRES_URL: 'postgresql://localhost:5432/test',
      // Missing SUPABASE_URL
      SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
      REDIS_URL: 'redis://localhost:6379',
      NEXT_PUBLIC_AGENT_URL: 'http://localhost:3000',
    };

    const result = envSchema.safeParse(invalidEnv);
    expect(result.success).toBe(false);
    
    if (!result.success) {
      expect(result.error.errors.some(e => e.path.includes('SUPABASE_URL'))).toBe(true);
    }
  });

  it('should fail on invalid URL format', () => {
    const invalidEnv = {
      POSTGRES_URL: 'not-a-url',
      SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
      REDIS_URL: 'redis://localhost:6379',
      NEXT_PUBLIC_AGENT_URL: 'http://localhost:3000',
    };

    const result = envSchema.safeParse(invalidEnv);
    expect(result.success).toBe(false);
    
    if (!result.success) {
      expect(result.error.errors.some(e => e.message.includes('Invalid POSTGRES_URL'))).toBe(true);
    }
  });

  it('should apply default values', () => {
    const minimalEnv = {
      POSTGRES_URL: 'postgresql://localhost:5432/test',
      SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
      REDIS_URL: 'redis://localhost:6379',
      NEXT_PUBLIC_AGENT_URL: 'http://localhost:3000',
    };

    const result = envSchema.parse(minimalEnv);
    
    expect(result.NODE_ENV).toBe('development');
    expect(result.AGENT_PORT).toBe(3000);
    expect(result.AGENT_HOST).toBe('0.0.0.0');
    expect(result.LOG_LEVEL).toBe('info');
    expect(result.FLY_APP_NAME).toBe('screengraph');
    expect(result.STORAGE_BUCKET).toBe('screengraph-assets');
  });

  it('should validate NODE_ENV values', () => {
    const validEnvs = ['development', 'production', 'test'];
    
    validEnvs.forEach(env => {
      const testEnv = {
        POSTGRES_URL: 'postgresql://localhost:5432/test',
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
        REDIS_URL: 'redis://localhost:6379',
        NEXT_PUBLIC_AGENT_URL: 'http://localhost:3000',
        NODE_ENV: env,
      };

      const result = envSchema.safeParse(testEnv);
      expect(result.success).toBe(true);
    });
  });

  it('should validate LOG_LEVEL values', () => {
    const validLevels = ['debug', 'info', 'warn', 'error'];
    
    validLevels.forEach(level => {
      const testEnv = {
        POSTGRES_URL: 'postgresql://localhost:5432/test',
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
        REDIS_URL: 'redis://localhost:6379',
        NEXT_PUBLIC_AGENT_URL: 'http://localhost:3000',
        LOG_LEVEL: level,
      };

      const result = envSchema.safeParse(testEnv);
      expect(result.success).toBe(true);
    });
  });

  it('should validate AGENT_PORT range', () => {
    const validPorts = [1, 3000, 65535];
    const invalidPorts = [0, 65536, -1];

    validPorts.forEach(port => {
      const testEnv = {
        POSTGRES_URL: 'postgresql://localhost:5432/test',
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
        REDIS_URL: 'redis://localhost:6379',
        NEXT_PUBLIC_AGENT_URL: 'http://localhost:3000',
        AGENT_PORT: port,
      };

      const result = envSchema.safeParse(testEnv);
      expect(result.success).toBe(true);
    });

    invalidPorts.forEach(port => {
      const testEnv = {
        POSTGRES_URL: 'postgresql://localhost:5432/test',
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
        REDIS_URL: 'redis://localhost:6379',
        NEXT_PUBLIC_AGENT_URL: 'http://localhost:3000',
        AGENT_PORT: port,
      };

      const result = envSchema.safeParse(testEnv);
      expect(result.success).toBe(false);
    });
  });

  it('should include all fly regions', () => {
    expect(flyRegions).toContain('iad');
    expect(flyRegions).toContain('dfw');
    expect(flyRegions).toContain('bom');
    expect(flyRegions).toHaveLength(3);
  });

  it('should exit on invalid configuration', () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Set invalid environment
    process.env.POSTGRES_URL = 'invalid-url';

    expect(() => getConfig()).toThrow('process.exit called');
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Environment validation failed'));

    exitSpy.mockRestore();
    consoleSpy.mockRestore();
  });
});
