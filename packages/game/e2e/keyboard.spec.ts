/** A full round with the keyboard alone, checking focus and announcements (spec: Keyboard, Focus). */
import { expect, test } from '@playwright/test';
import {
  expectFocusKept,
  liveRegion,
  SEED,
  tabTo,
  waitForPlayer,
} from './helpers';

test('a full round can be played with the keyboard alone', async ({ page }) => {
  await page.goto(`/?seed=${SEED}`);
  const live = liveRegion(page);
  const focused = page.locator(':focus');

  // Start: choose Zoologist with the arrow keys, then Next.
  await tabTo(page, 'input[type="radio"]');
  await page.keyboard.press('ArrowDown');
  await expect(page.getByLabel(/Zoologist/)).toBeChecked();
  await tabTo(page, 'button.tt-button--primary');
  await page.keyboard.press('Enter');

  // Pick: focus starts on the heading; the grid is one tab stop with arrow keys inside.
  await expect(focused).toHaveText('Pick your animal');
  await tabTo(page, '.tt-card');
  await expect(focused).toHaveAccessibleName('Cat');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowRight');
  await expect(focused).toHaveAccessibleName('Penguin');
  await page.keyboard.press('Space');
  await page.keyboard.press('Tab');
  await expect(focused).toHaveText('Start with the penguin');
  await page.keyboard.press('Enter');

  // Turn: focus on the banner, which says who starts (read once, through focus).
  await expect(focused).toHaveClass(/tt-banner/);
  await expect(focused).toContainText(
    'You go first. Ask a question or make a guess.',
  );
  await expect(live).toHaveText('');

  // The skip link jumps past the board to the filter box.
  await tabTo(page, '.tt-skip');
  await expect(focused).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(focused).toHaveAttribute('type', 'search');

  // Filtering announces the count after a pause; Escape clears it.
  await page.keyboard.type('mammal');
  await expect(live).toHaveText('1 of 68 questions match mammal.');
  await tabTo(page, 'button.tt-question');
  await page.keyboard.press('Enter');
  await expect(focused).toHaveAttribute('type', 'search');
  await expect(live).toHaveText(
    /^You asked: Is it a mammal\? The answer is (yes|no)\. \d+ of 24 animals are still in\. Computer's turn\.$/,
  );
  await waitForPlayer(page);
  await expect(live).toHaveText(/^The computer asked: .* Your turn\.$/);
  await page.keyboard.press('Escape');
  await expect(focused).toHaveValue('');

  // Back to the board: Space flips a mark on the card that holds the tab stop.
  await tabTo(page, '.tt-card', { back: true });
  const card = page.getByRole('button', { name: /^Cat/ });
  await expect(card).toBeFocused();
  const out = /tt-card--out/;
  const wasOut = await card.evaluate((el) => el.matches('.tt-card--out'));
  await page.keyboard.press('Space');
  await (wasOut
    ? expect(card).not.toHaveClass(out)
    : expect(card).toHaveClass(out));
  await page.keyboard.press('Space');
  await (wasOut
    ? expect(card).toHaveClass(out)
    : expect(card).not.toHaveClass(out));

  // Guess mode: the dialog opens on Cancel, Escape closes it and returns to the card.
  await tabTo(page, '.tt-modes button:nth-child(2)', { back: true });
  await page.keyboard.press('Enter');
  await tabTo(page, '.tt-card');
  await page.keyboard.press('Control+End');
  await expect(focused).toHaveAccessibleName(/^Guess Bat/);
  await page.keyboard.press('Enter');
  await expect(focused).toHaveText('Cancel');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(focused).toHaveAccessibleName(/^Bat/);
  await expect(page.locator('.tt-banner__turn')).toHaveText('Your turn');

  // A real guess: confirm with Yes. Wrong moves focus to the banner; right ends the game.
  await tabTo(page, '.tt-modes button:nth-child(2)', { back: true });
  await page.keyboard.press('Enter');
  await tabTo(page, '.tt-card');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Shift+Tab');
  await expect(focused).toHaveText(/^Yes, guess the /);
  await page.keyboard.press('Enter');
  await expectFocusKept(page);

  // Keep asking from the filter box until someone wins.
  for (let turn = 0; turn < 30; turn++) {
    if (await page.getByText('Game over').isVisible()) break;
    await waitForPlayer(page);
    if (await page.getByText('Game over').isVisible()) break;
    await tabTo(page, 'button.tt-question:not(:disabled)');
    await page.keyboard.press('Enter');
    await expectFocusKept(page);
  }

  // End: focus on the result heading, which the live region also announces.
  await expect(page.getByText('Game over')).toBeVisible();
  await expect(focused).toHaveText(/^(You won!|The computer won)$/);
  await expect(live).toHaveText(/won\./);
  await page.keyboard.press('Tab');
  await expect(focused).toHaveText('Play again');
  await page.keyboard.press('Enter');
  await expect(focused).toHaveText('Pick your animal');
});
