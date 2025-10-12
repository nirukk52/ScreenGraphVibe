import { test, expect } from '@playwright/test';

test.describe('Persona Management - CODEOWNERS panel', () => {
  test('preview and apply flow works', async ({ page }) => {
    await page.goto('/management/persona-management');

    await page.getByTestId('btn-preview').click();
    await expect(page.getByTestId('preview-box')).not.toHaveText('');

    await page.getByTestId('btn-apply').click();
    const status = page.getByTestId('apply-status');
    await expect(status).toBeVisible({ timeout: 10000 });
    await expect(status).not.toHaveText('');
    await expect(status).toHaveText(/Apply/i);
  });
});
