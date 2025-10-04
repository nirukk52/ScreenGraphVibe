import { describe, it, expect } from 'vitest';

/**
 * Base test that should always pass - ensures testing framework is working
 * This is the foundation test that all other tests extend from
 */
describe('Base Test Suite', () => {
  it('should always pass - testing framework is working', () => {
    expect(true).toBe(true);
  });

  it('should handle basic assertions', () => {
    const testValue = 'ScreenGraph';
    expect(testValue).toBe('ScreenGraph');
    expect(testValue).toHaveLength(11);
  });

  it('should handle async operations', async () => {
    const asyncFunction = async () => {
      return new Promise((resolve) => {
        setTimeout(() => resolve('async result'), 10);
      });
    };

    const result = await asyncFunction();
    expect(result).toBe('async result');
  });
});
