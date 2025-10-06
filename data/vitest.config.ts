import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    testTimeout: 10000,
    include: [
      'src/**/*.test.ts',
      'src/**/*.integration.test.ts'
    ],
  },
  resolve: {
    alias: {
      '@screengraph/tests': new URL('../tests/src', import.meta.url).pathname,
    },
  },
});

