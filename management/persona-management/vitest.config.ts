import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 10000,
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        lines: 0.4,
        statements: 0.4,
        branches: 0.4,
        functions: 0.4,
      },
    },
    include: [
      'src/**/*.test.ts',
      'src/**/*.integration.test.ts',
    ],
  },
});

