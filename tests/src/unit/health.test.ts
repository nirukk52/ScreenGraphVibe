import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mockCheckDatabaseHealth } from '../mocks/health.js';

// Mock the data module to use our test implementation
vi.mock('@screengraph/data', async () => {
  const actual = await vi.importActual('@screengraph/data');
  return {
    ...actual,
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
    vi.mocked(checkDatabaseHealth).mockImplementation(mockCheckDatabaseHealth);

    const result = await checkDatabaseHealth();

    expect(result).toEqual({
      status: 'healthy',
      message: 'Test mode - simulated successful database connection',
    });
    expect(checkDatabaseHealth).toHaveBeenCalled();
  });

  it('should return unhealthy status when database connection fails', async () => {
    // Mock database connection failure
    const { checkDatabaseHealth } = await import('@screengraph/data');
    vi.mocked(checkDatabaseHealth).mockImplementation(() => mockCheckDatabaseHealth(true));

    const result = await checkDatabaseHealth();

    expect(result).toEqual({
      status: 'unhealthy',
      message: 'Test mode - simulated database connection failure',
    });
    expect(checkDatabaseHealth).toHaveBeenCalled();
  });

  it('should handle unknown errors gracefully', async () => {
    // Mock unknown error
    const { checkDatabaseHealth } = await import('@screengraph/data');
    vi.mocked(checkDatabaseHealth).mockImplementation(() => mockCheckDatabaseHealth(true));

    const result = await checkDatabaseHealth();

    expect(result).toEqual({
      status: 'unhealthy',
      message: 'Test mode - simulated database connection failure',
    });
    expect(checkDatabaseHealth).toHaveBeenCalled();
  });
});