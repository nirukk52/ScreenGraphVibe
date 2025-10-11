import { test, expect } from '@playwright/test';

test.describe('Persona Management - Delete', () => {
  test('select persona → Delete shows status', async ({ page }) => {
    await page.goto('/management/persona-management');

    const firstItem = page.locator('[data-testid^="persona-"]').first();
    await firstItem.click();

    const del = page.getByTestId('editor-delete');
    await del.click();

    await expect(page.getByTestId('editor-status')).toBeVisible();
  });
});
