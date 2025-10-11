import { test, expect } from '@playwright/test';

test.describe('Persona Management - Facts & Assumptions', () => {
  test('add/edit/remove fact rows', async ({ page }) => {
    await page.goto('/management/persona-management');

    await page.getByTestId('btn-add-fact').click();
    await expect(page.getByTestId('fact-row-0')).toBeVisible();

    await page.getByTestId('fact-key-0').fill('test_key');
    await page.getByTestId('fact-value-0').fill('test_value');

    await expect(page.getByTestId('fact-key-0')).toHaveValue('test_key');
    await expect(page.getByTestId('fact-value-0')).toHaveValue('test_value');

    await page.getByTestId('btn-remove-0').click();
    await expect(page.getByTestId('fact-row-0')).not.toBeVisible();
  });
});

