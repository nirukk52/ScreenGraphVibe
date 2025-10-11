import { test, expect } from '@playwright/test';

test.describe('Persona Management Dashboard - Validation', () => {
  test('BEFORE/AFTER toggles enforce validity', async ({ page }) => {
    await page.goto('/management/persona-management');

    const before = page.getByTestId('toggle-before');
    const after = page.getByTestId('toggle-after');
    const status = page.getByTestId('status-valid');

    await expect(status).toHaveText('Incomplete');
    await before.check();
    await expect(status).toHaveText('Incomplete');
    await after.check();
    await expect(status).toHaveText('Valid');

    await after.uncheck();
    await expect(status).toHaveText('Incomplete');
  });
});
