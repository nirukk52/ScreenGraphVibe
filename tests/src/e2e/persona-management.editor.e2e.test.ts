import { test, expect } from '@playwright/test';

test.describe('Persona Management - Persona Editor', () => {
  test('clicking a persona shows it in the editor', async ({ page }) => {
    await page.goto('/management/persona-management');

    const firstItem = page.locator('[data-testid^="persona-"]').first();
    const firstText = await firstItem.textContent();

    await firstItem.click();

    await expect(page.getByTestId('panel-editor')).toBeVisible();
    if (firstText) {
      await expect(page.getByTestId('editor-title')).toContainText(firstText.trim());
    }
  });
});
