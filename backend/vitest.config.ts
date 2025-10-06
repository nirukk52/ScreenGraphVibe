import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    testTimeout: 10000,
    include: [
      'src/**/*.test.ts',
      'src/**/*.integration.test.ts',
      'src/**/tests/*.test.ts',
      'src/**/tests/*.integration.test.ts'
    ],
  },
});
