import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    css: true,
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
      'src/**/*.test.tsx',
      'src/**/*.test.ts',
      'src/**/*.integration.test.tsx',
      'src/**/*.integration.test.ts',
      'src/**/tests/*.test.tsx',
      'src/**/tests/*.test.ts',
      'src/**/tests/*.integration.test.tsx',
      'src/**/tests/*.integration.test.ts',
    ],
  },
});
