import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    testTimeout: 30000,
    include: ['src/integration/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@screengraph/data': new URL('../data/src', import.meta.url).pathname,
      '@screengraph/agent': new URL('../agent/src', import.meta.url).pathname,
      '@screengraph/logging': new URL('../logging/src', import.meta.url).pathname,
    },
  },
});
