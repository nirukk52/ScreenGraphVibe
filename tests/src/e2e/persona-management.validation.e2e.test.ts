import { test, expect } from '@playwright/test';

test.describe('Persona Management Dashboard - Validation', () => {
  test('BEFORE/AFTER toggles enforce validity', async ({ page }) => {
    await page.goto('/management/persona-management');

    const firstPersonaButton = page.locator('[data-testid^="persona-"]').first();
    await firstPersonaButton.waitFor({ state: 'visible' });
    const detailRequest = page.waitForResponse(response =>
      response.url().includes('/management/personas/') && response.request().method() === 'GET',
    );
    await firstPersonaButton.click();
    await detailRequest;

    await expect(page.getByTestId('editor-title')).not.toHaveText('No persona selected', {
      timeout: 10000,
    });

    const toggle = page.getByTestId('thinking-mode-toggle');
    await toggle.waitFor({ state: 'visible' });
    await toggle.click();

    const editor = page.getByTestId('thinking-editor');
    const beforeInputs = editor.locator('input[placeholder="Describe the preflight step"]');
    const afterInputs = editor.locator('input[placeholder="Describe the after-task action"]');
    const save = page.getByTestId('thinking-save');

    await expect(beforeInputs.first()).toHaveValue(/.+/);
    await expect(afterInputs.first()).toHaveValue(/.+/);
    await expect(save).toBeEnabled();
  });
});
