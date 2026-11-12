/** Renders og/og-default.html to public/og-default.png with headless Chromium (issue #34). */
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const source = new URL('og-default.html', import.meta.url);
const target = new URL('../public/og-default.png', import.meta.url);

const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
  });
  // Fail rather than render fallback fonts or reach the network.
  await page.route(/^https?:/, (route) => route.abort());
  await page.goto(source.href);
  await page.evaluate(() => document.fonts.ready);
  const loaded = await page.evaluate(() =>
    [...document.fonts].every((font) => font.status === 'loaded'),
  );
  if (!loaded)
    throw new Error('A font did not load: check the paths in og-default.html.');
  const png = await page.screenshot();
  // A palette PNG keeps the flat-colour card well under the 150 KB budget.
  const info = await sharp(png)
    .png({ palette: true, compressionLevel: 9 })
    .toFile(target.pathname);
  console.log(`Wrote ${target.pathname} (${Math.round(info.size / 1024)} KB)`);
} finally {
  await browser.close();
}
