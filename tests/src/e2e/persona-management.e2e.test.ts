import { test, expect } from '@playwright/test';

// E2E: Persona Management dashboard loads and key panels render
// Assumes UI is served at configured baseURL in playwright config

test.describe('Persona Management Dashboard', () => {
  test('renders dashboard and panels', async ({ page }) => {
    await page.goto('/management/persona-management');

    await expect(page.getByTestId('persona-dashboard')).toBeVisible();
    await expect(page.getByTestId('title')).toHaveText('Persona Management');

    await expect(page.getByTestId('panel-thinking')).toBeVisible();
    await expect(page.getByTestId('panel-facts')).toBeVisible();
    await expect(page.getByTestId('panel-ownership')).toBeVisible();
    await expect(page.getByTestId('panel-codeowners')).toBeVisible();

    // Validate BEFORE/AFTER toggles work
    const before = page.getByTestId('toggle-before');
    const after = page.getByTestId('toggle-after');
    const status = page.getByTestId('status-valid');

    await expect(status).toHaveText('Incomplete');
    await before.check();
    await expect(status).toHaveText('Incomplete');
    await after.check();
    await expect(status).toHaveText('Valid');
  });
});
