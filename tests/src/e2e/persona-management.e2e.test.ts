import { test, expect } from '@playwright/test';

// E2E: Persona Management dashboard loads and key panels render
// Assumes UI is served at configured baseURL in playwright config

test.describe('Persona Management Dashboard', () => {
  test('renders dashboard and panels', async ({ page }) => {
    await page.goto('/management/persona-management');

    await expect(page.getByTestId('persona-dashboard')).toBeVisible();
    await expect(page.getByTestId('title')).toHaveText('Shape every agent into a high-impact teammate');

    await expect(page.getByTestId('panel-thinking')).toBeVisible();
    await expect(page.getByTestId('panel-facts')).toBeVisible();
    await expect(page.getByTestId('panel-ownership')).toBeVisible();
    await expect(page.getByTestId('panel-codeowners')).toBeVisible();

    await expect(page.getByTestId('metric-personas')).toBeVisible();
    await expect(page.getByTestId('metric-sequential-thinking')).toBeVisible();
    await expect(page.getByTestId('metric-performance-logs')).toBeVisible();

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

    await expect(beforeInputs.first()).toHaveValue(/.+/);
    await expect(afterInputs.first()).toHaveValue(/.+/);
    await expect(page.getByTestId('thinking-save')).toBeEnabled();
  });
});
