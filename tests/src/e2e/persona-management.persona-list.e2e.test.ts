import { test, expect } from '@playwright/test';

test.describe('Persona Management - Persona List', () => {
  test('renders personas from backend', async ({ page }) => {
    await page.goto('/management/persona-management');
    await expect(page.getByTestId('panel-personas')).toBeVisible();
    // At least one persona item should be present (FS fallback ensures non-empty)
    const items = page.locator('[data-testid^="persona-"]');
    await expect(items.first()).toBeVisible();
  });
});
