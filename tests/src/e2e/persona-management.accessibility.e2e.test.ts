import { test, expect } from '@playwright/test';

test.describe('Persona Management Dashboard - Accessibility basics', () => {
  test('panels have headings and are visible', async ({ page }) => {
    await page.goto('/management/persona-management');

    await expect(page.getByTestId('panel-thinking')).toBeVisible();
    await expect(page.getByTestId('panel-facts')).toBeVisible();
    await expect(page.getByTestId('panel-ownership')).toBeVisible();
    await expect(page.getByTestId('panel-codeowners')).toBeVisible();
  });
});
