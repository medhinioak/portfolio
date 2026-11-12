/** Smoke test for every built page: status, one h1, and no third-party requests (ADR-0004). */
import { expect, test } from '@playwright/test';
import { builtRoutes } from './routes';

for (const route of builtRoutes()) {
  test(`${route.path} loads with one h1 and only same-origin requests`, async ({
    page,
    baseURL,
  }) => {
    const origin = new URL(baseURL ?? '').origin;
    const thirdParty: string[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.protocol.startsWith('http') && url.origin !== origin) {
        thirdParty.push(request.url());
      }
    });

    const response = await page.goto(route.path, { waitUntil: 'networkidle' });

    expect(response?.status()).toBe(route.status);
    await expect(page.locator('h1')).toHaveCount(1);
    expect(thirdParty, 'requests to other origins').toEqual([]);
  });
}

test('the 404 page renders its heading', async ({ page }) => {
  await page.goto('/this-page-does-not-exist/');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Page not found' }),
  ).toBeVisible();
});
