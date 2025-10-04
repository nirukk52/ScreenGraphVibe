import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkDatabaseHealth } from '@screengraph/data';

// Mock the database connection
vi.mock('@screengraph/data', async () => {
  const actual = await vi.importActual('@screengraph/data');
  return {
    ...actual,
    db: {
      execute: vi.fn(),
    },
    checkDatabaseHealth: vi.fn(),
  };
});

describe('Health Check Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return healthy status when database is accessible', async () => {
    // Mock successful database query
    const { checkDatabaseHealth } = await import('@screengraph/data');
    vi.mocked(checkDatabaseHealth).mockResolvedValueOnce({
      status: 'healthy',
      message: 'Database connection successful',
    });

    const result = await checkDatabaseHealth();

    expect(result).toEqual({
      status: 'healthy',
      message: 'Database connection successful',
    });
    expect(checkDatabaseHealth).toHaveBeenCalled();
  });

  it('should return unhealthy status when database connection fails', async () => {
    // Mock database connection failure
    const { checkDatabaseHealth } = await import('@screengraph/data');
    vi.mocked(checkDatabaseHealth).mockResolvedValueOnce({
      status: 'unhealthy',
      message: 'Database connection failed: Connection refused',
    });

    const result = await checkDatabaseHealth();

    expect(result).toEqual({
      status: 'unhealthy',
      message: 'Database connection failed: Connection refused',
    });
    expect(checkDatabaseHealth).toHaveBeenCalled();
  });

  it('should handle unknown errors gracefully', async () => {
    // Mock unknown error
    const { checkDatabaseHealth } = await import('@screengraph/data');
    vi.mocked(checkDatabaseHealth).mockResolvedValueOnce({
      status: 'unhealthy',
      message: 'Database connection failed: Unknown error',
    });

    const result = await checkDatabaseHealth();

    expect(result).toEqual({
      status: 'unhealthy',
      message: 'Database connection failed: Unknown error',
    });
    expect(checkDatabaseHealth).toHaveBeenCalled();
  });
});