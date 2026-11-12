/** SEO checks on the built site: head metadata on every page, sitemap and robots.txt (issue #34). */
import { expect, test, type Page } from '@playwright/test';
import { builtRoutes } from './routes';

const site = 'https://medhinioak.dev';

/** The head values of one page; null when the tag is missing. */
interface Head {
  path: string;
  title: string;
  description: string | null;
}

const content = (page: Page, selector: string): Promise<string | null> =>
  page.locator(selector).getAttribute('content');

test('every page has a title, description, Open Graph tags and the right canonical', async ({
  page,
}) => {
  const heads: Head[] = [];
  for (const route of builtRoutes()) {
    await page.goto(route.path);
    const notFound = route.status === 404;

    await expect(page.locator('title'), route.path).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    for (const property of ['og:title', 'og:description', 'og:image']) {
      await expect(page.locator(`meta[property="${property}"]`)).toHaveCount(1);
    }
    expect(await content(page, 'meta[name="twitter:card"]')).toBe(
      'summary_large_image',
    );
    expect(await content(page, 'meta[property="og:image"]')).toBe(
      `${site}/og-default.png`,
    );

    // The 404 page is served at any missing URL, so it has no URL of its own.
    const canonical = page.locator('link[rel="canonical"]');
    if (notFound) {
      await expect(canonical).toHaveCount(0);
    } else {
      await expect(canonical).toHaveAttribute('href', `${site}${route.path}`);
      expect(await content(page, 'meta[property="og:url"]')).toBe(
        `${site}${route.path}`,
      );
    }

    heads.push({
      path: route.path,
      title: await page.title(),
      description: await content(page, 'meta[name="description"]'),
    });
  }

  // Placeholders are caught by the deploy check, so only finished text must be unique.
  for (const key of ['title', 'description'] as const) {
    const values = heads
      .map((head) => head[key] ?? '')
      .filter((value) => !value.includes('PLACEHOLDER:'));
    const duplicates = values.filter((value, i) => values.indexOf(value) !== i);
    expect(duplicates, `duplicate ${key}s`).toEqual([]);
  }
});

test('the sitemap lists every page except the 404 page', async ({
  request,
}) => {
  const index = await (await request.get('/sitemap-index.xml')).text();
  expect(index).toContain(`<loc>${site}/sitemap-0.xml</loc>`);

  const sitemap = await (await request.get('/sitemap-0.xml')).text();
  const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => match[1],
  );
  const expected = builtRoutes()
    .filter((route) => route.status === 200)
    .map((route) => `${site}${route.path}`);
  expect(listed.toSorted()).toEqual(expected.toSorted());
});

test('robots.txt allows everything and points to the sitemap', async ({
  request,
}) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('User-agent: *\nAllow: /');
  expect(robots).toContain(`Sitemap: ${site}/sitemap-index.xml`);
});
