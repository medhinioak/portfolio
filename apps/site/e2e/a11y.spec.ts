/** axe on every built page in both themes; fails on serious or critical violations. */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { builtRoutes } from './routes';

const themes = ['light', 'dark'] as const;

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    test.use({ colorScheme: theme });

    test.beforeEach(async ({ page }) => {
      // The same choice the theme toggle stores; read before first paint.
      await page.addInitScript((value) => {
        localStorage.setItem('theme', value);
      }, theme);
    });

    for (const route of builtRoutes()) {
      test(`${route.path} has no serious or critical axe violations`, async ({
        page,
      }) => {
        await page.goto(route.path, { waitUntil: 'networkidle' });
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

        const { violations } = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        const blocking = violations
          .filter((v) => v.impact === 'serious' || v.impact === 'critical')
          .flatMap((v) =>
            v.nodes.map(
              (node) => `${v.id} (${v.impact}): ${node.target.join(' ')}`,
            ),
          );

        expect(blocking, 'serious or critical axe violations').toEqual([]);
      });
    }
  });
}
