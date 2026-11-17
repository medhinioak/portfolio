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
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
      'href',
      /^\/favicon\.ico(\?|$)/,
    );
    expect(thirdParty, 'requests to other origins').toEqual([]);
  });
}

test('the linked favicon is served as an icon', async ({ page, request }) => {
  await page.goto('/');
  const href = await page.locator('link[rel="icon"]').getAttribute('href');
  const response = await request.get(href ?? '/favicon.ico');

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toMatch(
    /^image\/(x-icon|vnd\.microsoft\.icon)/,
  );
  // ICO header: reserved 0, type 1 (icon).
  expect([...(await response.body()).subarray(0, 4)]).toEqual([0, 0, 1, 0]);
});

test('the 404 page renders its heading', async ({ page }) => {
  await page.goto('/this-page-does-not-exist/');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Page not found' }),
  ).toBeVisible();
});
