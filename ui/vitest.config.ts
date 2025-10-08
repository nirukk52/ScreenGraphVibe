import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    testTimeout: 10000,
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
