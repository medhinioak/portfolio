/** The game on /play: it hydrates and plays with the keyboard, fits a phone, and no other page loads it (issue #77). */
import { expect, test } from '@playwright/test';
import { builtRoutes } from './routes';

// The game's class prefix; every game component writes it into its chunk.
const gameMarker = 'tt-game';

test('/play hydrates the game and starts a round with the keyboard', async ({
  page,
}) => {
  await page.goto('/play/');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Tail Trail' }),
  ).toBeVisible();

  const next = page.getByRole('button', { name: 'Next: pick your animal' });
  await next.focus();
  await page.keyboard.press('Enter');

  await expect(page.getByRole('button', { name: 'Surprise me' })).toBeVisible();
  await page.getByRole('button', { name: 'Surprise me' }).press('Enter');
  await expect(page.getByRole('heading', { level: 1 })).toHaveId(
    'tt-turn-title',
  );
});

test('/play draws the pixel-art sprites, not the placeholder box', async ({
  page,
}) => {
  await page.goto('/play/');
  const strip = page.locator('.tt-strip .tt-sprite');
  await expect(strip).toHaveCount(8);
  // Placeholders are a rect and a cross; the sprites are filled paths only.
  await expect(page.locator('.tt-sprite rect')).toHaveCount(0);
  await expect(strip.first().locator('path[fill="currentColor"]')).toHaveCount(
    1,
  );
});

test('/play fits a 320px phone without scrolling sideways', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/play/');
  await page.getByRole('button', { name: 'Next: pick your animal' }).click();
  await page.getByRole('button', { name: 'Surprise me' }).click();
  await expect(page.locator('#tt-turn-title')).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test('Play is in the header nav and marked current on /play', async ({
  page,
}) => {
  await page.goto('/play/');
  await expect(
    page.locator('.site-nav').getByRole('link', { name: 'Play' }),
  ).toHaveAttribute('aria-current', 'page');
});

for (const route of builtRoutes().filter((r) => r.path !== '/play/')) {
  test(`${route.path} loads no game JavaScript`, async ({ page }) => {
    const scripts: Promise<string>[] = [];
    page.on('response', (response) => {
      if (response.request().resourceType() === 'script') {
        scripts.push(response.text());
      }
    });

    await page.goto(route.path, { waitUntil: 'networkidle' });

    const bodies = await Promise.all(scripts);
    expect(bodies.filter((body) => body.includes(gameMarker))).toEqual([]);
  });
}
