/** axe on every screen of the game, in both themes; fails on serious or critical violations. */
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { playToTheEnd, SEED, startGame, waitForPlayer } from './helpers';

/** The same tags and threshold as the site's own axe run (apps/site/e2e/a11y.spec.ts). */
async function expectNoBlockingViolations(page: Page): Promise<void> {
  const { violations } = await new AxeBuilder({ page })
    .include('.tt-game')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const blocking = violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .flatMap((v) =>
      v.nodes.map((node) => `${v.id} (${v.impact}): ${node.target.join(' ')}`),
    );
  expect(blocking, 'serious or critical axe violations').toEqual([]);
}

for (const theme of ['light', 'dark'] as const) {
  test.describe(`${theme} theme`, () => {
    test.use({ colorScheme: theme });

    test('start and pick screens', async ({ page }) => {
      await page.goto(`/?seed=${SEED}`);
      await expectNoBlockingViolations(page);
      await page
        .getByRole('button', { name: 'Next: pick your animal' })
        .click();
      await page.getByRole('button', { name: 'Penguin' }).click();
      await expectNoBlockingViolations(page);
    });

    test('turn screen, guess dialog and end screen', async ({ page }) => {
      await startGame(page);
      // After one answer some cards are ruled out, so both card looks are checked.
      await page.locator('.tt-question:not(:disabled)').first().click();
      await waitForPlayer(page);
      await expectNoBlockingViolations(page);

      await page.getByRole('button', { name: 'Make a guess' }).click();
      await page.getByRole('button', { name: 'Guess Tiger' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expectNoBlockingViolations(page);
      await page.getByRole('button', { name: 'Cancel' }).click();

      await playToTheEnd(page);
      await expectNoBlockingViolations(page);
    });
  });
}
