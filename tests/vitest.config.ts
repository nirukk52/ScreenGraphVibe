import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    testTimeout: 10000,
    setupFiles: ['./src/setup.ts'],
    include: [
      'src/unit/**/*.test.ts',
      '../agent/src/features/**/tests/*.test.ts',
      '../ui/src/features/**/tests/*.test.tsx'
    ],
    exclude: ['**/e2e/**/*'],
  },
  resolve: {
    alias: {
      '@screengraph/data': new URL('../data/src', import.meta.url).pathname,
      '@screengraph/agent': new URL('../agent/src', import.meta.url).pathname,
      '@screengraph/infra': new URL('../infra/src', import.meta.url).pathname,
      '@screengraph/logging': new URL('../logging/src', import.meta.url).pathname,
    },
  },
});
