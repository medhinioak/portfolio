/** Phone widths: no sideways scrolling, big enough targets, one board at a time (spec: Layout). */
import { expect, test, type Page } from '@playwright/test';
import { playToTheEnd, SEED, startGame } from './helpers';

/** The page must never scroll sideways. */
async function expectNoSidewaysScroll(page: Page): Promise<void> {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow, 'page is wider than the viewport').toBeLessThanOrEqual(0);
}

/** Every visible control is at least 24 × 24 px (WCAG 2.2, 2.5.8). */
async function expectTargetsBigEnough(page: Page): Promise<void> {
  const small = await page.evaluate(() =>
    [
      ...document.querySelectorAll(
        '.tt-game button, .tt-game a, .tt-game input',
      ),
    ]
      .map((el) => ({ el, box: el.getBoundingClientRect() }))
      .filter(({ box }) => box.width > 0 && box.height > 0)
      .filter(({ el }) => !el.closest('.tt-sr-only'))
      .filter(({ box }) => box.width < 24 || box.height < 24)
      .map(({ el }) => el.textContent?.trim() || el.outerHTML.slice(0, 60)),
  );
  expect(small, 'targets smaller than 24 × 24 px').toEqual([]);
}

for (const width of [390, 320]) {
  test.describe(`${width} px wide`, () => {
    test.use({ viewport: { width, height: 800 } });

    test('every screen fits and has big enough targets', async ({ page }) => {
      await page.goto(`/?seed=${SEED}`);
      await expectNoSidewaysScroll(page);
      await expectTargetsBigEnough(page);

      await page
        .getByRole('button', { name: 'Next: pick your animal' })
        .click();
      await expectNoSidewaysScroll(page);
      await expectTargetsBigEnough(page);

      await page.getByRole('button', { name: 'Back' }).click();
      await startGame(page);
      await expectNoSidewaysScroll(page);
      await expectTargetsBigEnough(page);

      await playToTheEnd(page);
      await expectNoSidewaysScroll(page);
      await expectTargetsBigEnough(page);
    });

    test('the board switch shows one board at a time', async ({ page }) => {
      await startGame(page);
      const yours = page.getByRole('heading', { name: 'Your board' });
      const computers = page.getByRole('heading', { name: "Computer's board" });
      await expect(yours).toBeVisible();
      await expect(computers).toBeHidden();

      await page.getByRole('button', { name: "Computer's board" }).click();
      await expect(computers).toBeVisible();
      await expect(yours).toBeHidden();
      await expectNoSidewaysScroll(page);
    });
  });
}

test('desktop shows both boards and no switch', async ({ page }) => {
  await startGame(page);
  await expect(page.getByRole('heading', { name: 'Your board' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: "Computer's board" }),
  ).toBeVisible();
  await expect(page.getByRole('group', { name: 'Board to show' })).toBeHidden();
});
