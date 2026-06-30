import { expect, test } from '@playwright/test';

test('marketing home page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/TCG Vault/i);
});

test('privacy page is reachable', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page.getByText(/privacy|LGPD/i).first()).toBeVisible();
});

test('unauthenticated /app redirects to home', async ({ page }) => {
  await page.goto('/app');
  await expect(page).toHaveURL(/\?auth=required|\/$/);
});
