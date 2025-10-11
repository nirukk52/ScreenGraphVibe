import { test, expect } from '@playwright/test';

test.describe('Persona Management - Ownership toggles', () => {
  test('toggle ownership for :backend and :ui', async ({ page }) => {
    await page.goto('/management/persona-management');

    const ownBackend = page.getByTestId('own-backend');
    const ownUi = page.getByTestId('own-ui');

    await expect(ownBackend).not.toBeChecked();
    await expect(ownUi).not.toBeChecked();

    await ownBackend.check();
    await ownUi.check();

    await expect(ownBackend).toBeChecked();
    await expect(ownUi).toBeChecked();
  });
});
