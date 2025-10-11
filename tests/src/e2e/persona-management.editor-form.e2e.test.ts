import { test, expect } from '@playwright/test';

test.describe('Persona Management - Editor Form', () => {
  test('enables Save when name and role are filled', async ({ page }) => {
    await page.goto('/management/persona-management');

    const firstItem = page.locator('[data-testid^="persona-"]').first();
    await firstItem.click();

    const save = page.getByTestId('editor-save');
    const name = page.getByTestId('editor-name');
    const role = page.getByTestId('editor-role');

    await expect(save).toBeDisabled();
    await name.fill('Test Persona');
    await expect(save).toBeDisabled();
    await role.fill('Tester');
    await expect(save).toBeEnabled();
  });
});
