import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html', // Generate HTML report
  timeout: 30000, // 30 second timeout per test
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    // Ensure browser closes after tests
    launchOptions: {
      headless: true,
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Force browser to close after tests
        launchOptions: {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
      },
    },
  ],

  // Disable any global setup that might conflict with Vitest
  globalSetup: undefined,
  globalTeardown: undefined,
  
  // Ensure proper exit
  webServer: undefined,
});
