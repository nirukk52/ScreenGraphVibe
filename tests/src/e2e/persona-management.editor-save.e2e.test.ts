import { test, expect } from '@playwright/test';

test.describe('Persona Management - Editor Save', () => {
  test('Save shows status after PUT', async ({ page }) => {
    await page.goto('/management/persona-management');

    const firstItem = page.locator('[data-testid^="persona-"]').first();
    await firstItem.click();

    const save = page.getByTestId('editor-save');
    const name = page.getByTestId('editor-name');
    const role = page.getByTestId('editor-role');

    await name.fill('Updated Name');
    await role.fill('Updated Role');
    await save.click();

    await expect(page.getByTestId('editor-status')).toBeVisible();
  });
});
