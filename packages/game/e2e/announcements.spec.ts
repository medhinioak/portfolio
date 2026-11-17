/** Screen-reader timing: what is read when focus moves or the live region changes (issue #90). */
import { expect, test, type Page } from '@playwright/test';
import { liveRegion, startGame, waitForPlayer } from './helpers';

/** Records every text the live region shows, in order, in `window.liveLog`. */
async function recordLiveRegion(page: Page): Promise<void> {
  await liveRegion(page).evaluate((region) => {
    const log: string[] = [];
    Object.assign(window, { liveLog: log });
    new MutationObserver(() => log.push(region.textContent ?? '')).observe(
      region,
      { childList: true, characterData: true, subtree: true },
    );
  });
}

/** Reads back what {@link recordLiveRegion} saw. */
async function liveLog(page: Page): Promise<string[]> {
  return page.evaluate(
    () => (window as unknown as { liveLog: string[] }).liveLog,
  );
}

test('a wrong guess moves focus to the banner, which already shows the result', async ({
  page,
}) => {
  await startGame(page);

  // Ask about mammals, then guess an animal the answer rules out: a sure wrong guess.
  await page.getByRole('button', { name: 'Is it a mammal?' }).click();
  await waitForPlayer(page);
  const answer = page.locator('.tt-question__answer').first();
  await expect(answer).toHaveText(/^✓ (Yes|No)$/);
  const mammal = (await answer.textContent())?.includes('Yes');
  const wrong = mammal ? 'Eagle' : 'Tiger';

  // The banner's text each time it gets focus is what a screen reader reads.
  await page.evaluate(() => {
    const banner = document.querySelector('.tt-banner');
    const atFocus: string[] = [];
    Object.assign(window, { bannerAtFocus: atFocus });
    banner?.addEventListener('focus', () =>
      atFocus.push(banner.textContent ?? ''),
    );
  });

  await page.getByRole('button', { name: 'Make a guess' }).click();
  await page
    .getByRole('button', { name: new RegExp(`^Guess ${wrong}`) })
    .click();
  await page.getByRole('button', { name: /^Yes, guess the / }).click();

  await expect(page.locator('.tt-banner')).toBeFocused();
  const atFocus = await page.evaluate(
    () => (window as unknown as { bannerAtFocus: string[] }).bannerAtFocus,
  );
  // The first focus must already read the result, not the old banner.
  expect(atFocus[0]).toContain(`You guessed ${wrong}. That is not it.`);
});

test.describe('a count still pending when a move is made is never said', () => {
  // A fake clock holds the filter's 500 ms pause open, however slow the runner is.
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await startGame(page);
    await recordLiveRegion(page);
    await page.getByLabel('Filter questions').fill('mammal');
  });

  test('asking announces the move, not the count', async ({ page }) => {
    await page.getByRole('button', { name: 'Is it a mammal?' }).click();
    await page.clock.runFor(5000);
    await waitForPlayer(page);

    const log = await liveLog(page);
    expect(log.some((text) => text.startsWith('You asked:'))).toBe(true);
    expect(log.filter((text) => text.includes('questions match'))).toEqual([]);
  });

  test('starting a guess drops the count', async ({ page }) => {
    await page.getByRole('button', { name: 'Make a guess' }).click();
    await page.clock.runFor(5000);

    const log = await liveLog(page);
    expect(log.filter((text) => text.includes('questions match'))).toEqual([]);
  });
});
