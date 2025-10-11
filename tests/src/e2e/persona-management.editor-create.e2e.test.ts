import { test, expect } from '@playwright/test';

test.describe('Persona Management - Create', () => {
  test('New → fill → Save shows status', async ({ page }) => {
    await page.goto('/management/persona-management');

    await page.getByTestId('btn-new-persona').click();
    await expect(page.getByTestId('panel-editor')).toBeVisible();

    const name = page.getByTestId('editor-name');
    const role = page.getByTestId('editor-role');
    const save = page.getByTestId('editor-save');

    await name.fill('New Persona');
    await role.fill('New Role');
    await save.click();

    await expect(page.getByTestId('editor-status')).toBeVisible();
  });
});
