/** Screen-reader timing: what is read when focus moves or the live region changes (issue #90). */
import { expect, test, type Page } from '@playwright/test';
import { liveRegion, startGame, waitForPlayer } from './helpers';

/** Records every text the live region shows, in order, in `window.liveLog`. */
async function recordLiveRegion(page: Page): Promise<void> {
  await page.evaluate(() => {
    const region = document.querySelector('.tt-game > [role="status"]');
    const log: string[] = [];
    Object.assign(window, { liveLog: log });
    if (!region) throw new Error('No live region');
    new MutationObserver(() => log.push(region.textContent ?? '')).observe(
      region,
      { childList: true, characterData: true, subtree: true },
    );
  });
}

test('a wrong guess moves focus to the banner, which already shows the result', async ({
  page,
}) => {
  await startGame(page);

  // Ask about mammals, then guess an animal the answer rules out: a sure wrong guess.
  await page.getByRole('button', { name: 'Is it a mammal?' }).click();
  await waitForPlayer(page);
  const mammal = (
    await page.locator('.tt-question__answer').first().textContent()
  )?.includes('Yes');
  const wrong = mammal ? 'Eagle' : 'Tiger';

  // The banner's text at the moment it gets focus is what a screen reader reads.
  await page.evaluate(() => {
    const banner = document.querySelector('.tt-banner');
    banner?.addEventListener('focus', () => {
      Object.assign(window, { bannerAtFocus: banner.textContent });
    });
  });

  await page.getByRole('button', { name: 'Make a guess' }).click();
  await page
    .getByRole('button', { name: new RegExp(`^Guess ${wrong}`) })
    .click();
  await page.getByRole('button', { name: /^Yes, guess the / }).click();

  await expect(page.locator('.tt-banner')).toBeFocused();
  const atFocus = await page.evaluate(
    () => (window as unknown as { bannerAtFocus?: string }).bannerAtFocus,
  );
  expect(atFocus).toContain(`You guessed ${wrong}. That is not it.`);
});

test('asking right after typing in the filter announces the move, not the count', async ({
  page,
}) => {
  await startGame(page);
  await recordLiveRegion(page);

  // Ask well within the filter's 500 ms pause, so its count is still pending.
  await page.getByLabel('Filter questions').fill('mammal');
  await page.getByRole('button', { name: 'Is it a mammal?' }).click();
  await waitForPlayer(page);

  const log = await page.evaluate(
    () => (window as unknown as { liveLog: string[] }).liveLog,
  );
  const asked = log.findIndex((text) => text.startsWith('You asked:'));
  expect(asked, 'the move was announced').toBeGreaterThanOrEqual(0);
  expect(
    log.slice(asked).filter((text) => text.includes('questions match')),
  ).toEqual([]);
  await expect(liveRegion(page)).toHaveText(
    /^The computer asked: .* Your turn\.$/,
  );
});
