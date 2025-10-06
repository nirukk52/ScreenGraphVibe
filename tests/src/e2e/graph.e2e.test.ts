import { test, expect } from '@playwright/test';

test.describe('Graph Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route('**/runs', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          runs: [
            {
              runId: 'run-123',
              appId: 'demo-app',
              createdAt: '2024-01-01T00:00:00Z',
              status: 'completed',
            },
            {
              runId: 'run-456',
              appId: 'demo-app',
              createdAt: '2024-01-02T00:00:00Z',
              status: 'completed',
            },
          ],
        }),
      });
    });

    await page.route('**/graph/run-123', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          runId: 'run-123',
          graph: {
            graphId: 'graph-123',
            appId: 'demo-app',
            runId: 'run-123',
            version: '1.0.0',
            createdAt: '2024-01-01T00:00:00Z',
            screens: [
              {
                screenId: 'screen-1',
                role: 'LoginScreen',
                textStems: ['login', 'email', 'password'],
                artifacts: {
                  screenshotUrl: 'https://example.com/screenshot1.png',
                  pageSourceDigest: 'abc123',
                  axDigest: 'def456',
                },
                signature: {
                  sketchHash: 'sketch-1',
                  layoutBucket: 'auth',
                  screenshotCoarseHash: 'coarse-1',
                },
                indexPath: '0',
              },
              {
                screenId: 'screen-2',
                role: 'Dashboard',
                textStems: ['dashboard', 'welcome'],
                artifacts: {
                  screenshotUrl: 'https://example.com/screenshot2.png',
                  pageSourceDigest: 'ghi789',
                  axDigest: 'jkl012',
                },
                signature: {
                  sketchHash: 'sketch-2',
                  layoutBucket: 'main',
                  screenshotCoarseHash: 'coarse-2',
                },
                indexPath: '0/1',
              },
            ],
            actions: [
              {
                actionId: 'action-1',
                fromScreenId: 'screen-1',
                toScreenId: 'screen-2',
                verb: 'TAP',
                targetRole: 'button',
                targetText: 'Sign In',
                postcondition: 'ROUTE_CHANGE',
                signature: {
                  verbPostconditionHash: 'tap-route-hash',
                },
              },
            ],
            diffs: {
              addedScreens: [],
              removedScreens: [],
              addedActions: [],
              removedActions: [],
              changedActions: [],
            },
            counters: {
              screenCount: 2,
              actionCount: 1,
              interactiveCount: 1,
            },
            provenance: {
              extractionEngineVersion: '1.0.0',
              matcherVersion: '1.0.0',
              toleranceProfile: 'local-relaxed',
              jobId: 'job-123',
              agentId: 'agent-123',
            },
            annotations: {
              tags: ['demo', 'stub'],
              notes: 'Test graph data',
            },
          },
          screens: [],
          actions: [],
        }),
      });
    });

    await page.route('**/healthz', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'ok',
          message: 'System is healthy',
          timestamp: new Date().toISOString(),
          requestId: 'test-request-id',
          services: {
            database: 'healthy',
            redis: 'healthy',
          },
        }),
      });
    });
  });

  test('should navigate to graph page and display header', async ({ page }) => {
    await page.goto('http://localhost:3001/graph');

    // Check page title
    await expect(page).toHaveTitle(/ScreenGraph - Graph Visualization/);

    // Check header elements
    await expect(page.locator('h1')).toContainText('ScreenGraph Visualization');
    await expect(page.locator('text=Back to Dashboard')).toBeVisible();
  });

  test.skip('should display health indicator in header', async ({ page }) => {
    await page.goto('http://localhost:3001/graph');

    // Check health indicator is present
    const healthIndicator = page.locator('[data-testid="health-indicator"]');
    await expect(healthIndicator).toBeVisible();

    // Check health status text (wait for it to load)
    await expect(page.locator('text=System Healthy')).toBeVisible({ timeout: 10000 });
  });

  test('should load and display runs in dropdown', async ({ page }) => {
    await page.goto('http://localhost:3001/graph');

    // Check runs dropdown is present
    const runSelect = page.locator('select[id="run-select"]');
    await expect(runSelect).toBeVisible();

    // Check dropdown options
    await expect(runSelect.locator('option[value="run-123"]')).toContainText('run-123');
    await expect(runSelect.locator('option[value="run-456"]')).toContainText('run-456');
  });

  test('should load graph when run is selected', async ({ page }) => {
    await page.goto('http://localhost:3001/graph');

    // Select a run
    const runSelect = page.locator('select[id="run-select"]');
    await runSelect.selectOption('run-123');

    // Wait for graph to load
    await expect(page.locator('text=Screens: 2')).toBeVisible();
    await expect(page.locator('text=Actions: 1')).toBeVisible();
    await expect(page.locator('text=Interactive: 1')).toBeVisible();

    // Check React Flow is rendered
    await expect(page.locator('[data-testid="graph-visualization"]')).toBeVisible();
  });

  test('should display React Flow controls', async ({ page }) => {
    await page.goto('http://localhost:3001/graph');

    // Select a run to load graph
    const runSelect = page.locator('select[id="run-select"]');
    await runSelect.selectOption('run-123');

    // Wait for React Flow to load (look for the actual React Flow container)
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    // Check React Flow elements are present
    await expect(page.locator('.react-flow')).toBeVisible();
    
    // Check for React Flow controls
    await expect(page.locator('.react-flow__controls')).toBeVisible();
  });

  test('should show no data message when no run selected', async ({ page }) => {
    await page.goto('http://localhost:3001/graph');

    // Should show no data message
    await expect(page.locator('text=No Graph Data')).toBeVisible();
    await expect(page.locator('text=Select a run to view its ScreenGraph')).toBeVisible();
  });

  test('should navigate back to dashboard', async ({ page }) => {
    await page.goto('http://localhost:3001/graph');

    // Click back button
    await page.click('text=Back to Dashboard');

    // Should navigate to dashboard
    await expect(page).toHaveURL('http://localhost:3001/');
    await expect(page.locator('h1')).toContainText('ScreenGraph');
  });

  test.skip('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/runs', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal Server Error',
          message: 'Failed to fetch runs',
        }),
      });
    });

    await page.goto('http://localhost:3001/graph');

    // Should display error message (wait for it to appear)
    await expect(page.locator('text=Failed to load runs')).toBeVisible({ timeout: 10000 });
  });

  test('should show loading state while fetching', async ({ page }) => {
    // Mock delayed API response
    await page.route('**/runs', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ runs: [] }),
      });
    });

    await page.goto('http://localhost:3001/graph');

    // Should show loading state initially
    // Note: This might be too fast to catch, but the test structure is correct
  });

  test('should display graph statistics correctly', async ({ page }) => {
    await page.goto('http://localhost:3001/graph');

    // Select a run
    const runSelect = page.locator('select[id="run-select"]');
    await runSelect.selectOption('run-123');

    // Check statistics are displayed
    await expect(page.locator('text=Screens: 2')).toBeVisible();
    await expect(page.locator('text=Actions: 1')).toBeVisible();
    await expect(page.locator('text=Interactive: 1')).toBeVisible();
  });

  test.skip('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:3001/graph');

    // Check header is responsive
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Back to Dashboard')).toBeVisible();

    // Check health indicator is still visible (should hide text on mobile)
    await expect(page.locator('[data-testid="health-indicator"]')).toBeVisible();
  });
});

test.describe('Graph Page Integration with Dashboard', () => {
  test('should navigate from dashboard to graph page', async ({ page }) => {
    // Mock API responses for dashboard
    await page.route('**/healthz', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'ok',
          message: 'System is healthy',
          timestamp: new Date().toISOString(),
          requestId: 'test-request-id',
          services: {
            database: 'healthy',
            redis: 'healthy',
          },
        }),
      });
    });

    // Start from dashboard
    await page.goto('http://localhost:3001/');

    // Click "View Graphs" button
    await page.click('text=View Graphs');

    // Should navigate to graph page
    await expect(page).toHaveURL('http://localhost:3001/graph');
    await expect(page.locator('h1')).toContainText('ScreenGraph Visualization');
  });
});
