/** Phone menu drawer keyboard behaviour (ADR-0007) at a 390 px viewport. */
import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('opening moves focus to Close, Tab stays inside, Escape returns focus', async ({
  page,
}) => {
  const menuButton = page.getByRole('button', { name: 'Menu', exact: true });
  const drawer = page.locator('#site-menu');

  await menuButton.click();
  await expect(drawer).toBeVisible();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('button', { name: 'Close menu' })).toBeFocused();

  // Past the last item a native modal dialog hands focus to the browser's own UI (the
  // page sees <body>), then wraps back to Close. Page content behind it must never get
  // focus. One press per item plus one for the browser UI brings focus back to Close.
  const focusable = await drawer.locator('a, button').count();
  for (let i = 0; i < focusable + 1; i++) {
    await page.keyboard.press('Tab');
    const where = await page.evaluate(() => {
      const active = document.activeElement;
      if (!active || active === document.body) return 'browser';
      return active.closest('#site-menu') ? 'drawer' : 'page';
    });
    expect(where, `focus after ${i + 1} Tab presses`).not.toBe('page');
  }
  await expect(page.getByRole('button', { name: 'Close menu' })).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  await expect(menuButton).toBeFocused();
});

test('Contact closes the drawer and lands on #contact', async ({ page }) => {
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page
    .locator('#site-menu')
    .getByRole('link', { name: 'Contact' })
    .click();

  await expect(page.locator('#site-menu')).toBeHidden();
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.locator('#contact')).toBeInViewport();
});
