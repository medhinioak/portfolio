/** Shared steps for the playground's end-to-end tests. */
import { expect, type Locator, type Page } from '@playwright/test';

/** A fixed seed, so the computer's animal and moves repeat on every run. */
export const SEED = 'e2e';

/** The game's one polite live region. */
export function liveRegion(page: Page): Locator {
  return page.locator('.tt-game > [role="status"]');
}

/** Fails if focus has fallen to the page body (spec: Focus). */
export async function expectFocusKept(page: Page): Promise<void> {
  const tag = await page.evaluate(() => document.activeElement?.tagName);
  expect(tag, 'focus fell to the page body').not.toBe('BODY');
}

/** Presses Tab (or Shift+Tab) until the focused element matches the CSS `selector`. */
export async function tabTo(
  page: Page,
  selector: string,
  { back = false, limit = 120 } = {},
): Promise<void> {
  for (let i = 0; i < limit; i++) {
    await page.keyboard.press(back ? 'Shift+Tab' : 'Tab');
    const found = await page.evaluate(
      (s) => document.activeElement?.matches(s) ?? false,
      selector,
    );
    if (found) return;
  }
  throw new Error(`Tab never reached ${selector}`);
}

/** Starts a game with the mouse: Breezy, the penguin. Ends on the Turn screen. */
export async function startGame(page: Page): Promise<void> {
  await page.goto(`/?seed=${SEED}`);
  await page.getByLabel(/Breezy/).check();
  await page.getByRole('button', { name: 'Next: pick your animal' }).click();
  await page.getByRole('button', { name: 'Penguin' }).click();
  await page.getByRole('button', { name: 'Start with the penguin' }).click();
  await expect(page.getByText('Your turn', { exact: true })).toBeVisible();
}

/** Waits until the computer has moved and it is the player's turn, or the game is over. */
export async function waitForPlayer(page: Page): Promise<void> {
  await expect(liveRegion(page)).toHaveText(/Your turn\.$|won\./, {
    timeout: 5000,
  });
}

/** Asks the first open question with the mouse until the game ends. */
export async function playToTheEnd(page: Page): Promise<void> {
  for (let turn = 0; turn < 30; turn++) {
    if (await page.getByText('Game over').isVisible()) return;
    await page.locator('.tt-question:not(:disabled)').first().click();
    await waitForPlayer(page);
  }
  await expect(page.getByText('Game over')).toBeVisible();
}
