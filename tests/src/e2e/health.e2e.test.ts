// tests/health.e2e.spec.ts
import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' }); // one backend, avoid cross-test contention

const APP_URL = 'http://localhost:3001';
const HEALTH_URL_SUBSTR = '/healthz';

test('shows health status after initial load', async ({ page }) => {
  await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });

  // Wait for the app’s initial health request to resolve
  await page.waitForResponse(r =>
    r.url().includes(HEALTH_URL_SUBSTR) && r.request().method() === 'GET'
  );

  const status = page.getByTestId('health-status');
  await expect(status).toBeVisible();

  // Contract: status text is non-empty and contains a known label
  await expect(status).toHaveText(/healthy|unhealthy/i);
});

test('renders one clear status chip (healthy OR unhealthy)', async ({ page }) => {
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForResponse(r => r.url().includes(HEALTH_URL_SUBSTR) && r.request().method() === 'GET');
  
    const status = page.getByTestId('health-status');
    // Exact label, case-insensitive - should contain either "Healthy" or "Unhealthy"
    await expect(status).toHaveText(/healthy|unhealthy/i);
    await expect(status).toBeVisible();
  });
  

test.skip('manual refresh triggers a new health check and completes', async ({ page }) => {
  await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });

  // Ensure initial health completed so we compare behavior after refresh
  await page.waitForResponse(r =>
    r.url().includes(HEALTH_URL_SUBSTR) && r.request().method() === 'GET'
  );

  const refreshBtn = page.getByTestId('health-refresh-button');
  await expect(refreshBtn).toBeVisible();
  await expect(refreshBtn).toBeEnabled();

  // Click and wait for busy state
  await refreshBtn.click();

  // Wait for UI state change: button becomes busy and disabled
  await expect(refreshBtn).toBeDisabled();
  await expect(refreshBtn).toHaveAttribute('aria-busy', 'true');
  
  // Wait for the health response to complete
  const res = await page.waitForResponse(r =>
    r.url().includes(HEALTH_URL_SUBSTR) && r.request().method() === 'GET'
  );

  // Assert final UI state: button becomes idle and enabled
  await expect(refreshBtn).toBeEnabled();
  await expect(refreshBtn).toHaveAttribute('aria-busy', 'false');

  // Status remains visible and valid after refresh
  const status = page.getByTestId('health-status');
  await expect(status).toBeVisible();
  await expect(status).toHaveText(/healthy|unhealthy/i);

  // Assert timestamp updated (if available)
  const lastChecked = page.getByTestId('health-last-checked');
  if (await lastChecked.isVisible()) {
    const updatedText = await lastChecked.textContent();
    expect(updatedText && updatedText.trim().length > 0).toBe(true);
  }

  // Sanity: response must be OK
  expect(res.ok()).toBe(true);
});
