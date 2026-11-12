import { describe, expect, it } from 'vitest';
import { articleJsonLd, canonicalUrl, jsonLdScript } from './seo';

const site = new URL('https://medhinioak.dev');

describe('canonicalUrl', () => {
  it('keeps the root and paths that already end in a slash', () => {
    expect(canonicalUrl('/', site)).toBe('https://medhinioak.dev/');
    expect(canonicalUrl('/blog/post-1/', site)).toBe(
      'https://medhinioak.dev/blog/post-1/',
    );
  });

  it('adds the slash GitHub Pages redirects to for directory pages', () => {
    expect(canonicalUrl('/about', site)).toBe('https://medhinioak.dev/about/');
  });

  it('leaves file paths alone', () => {
    expect(canonicalUrl('/404.html', site)).toBe(
      'https://medhinioak.dev/404.html',
    );
  });
});

describe('articleJsonLd', () => {
  const post = {
    title: 'Post',
    description: 'About it.',
    url: 'https://medhinioak.dev/blog/post/',
    image: 'https://medhinioak.dev/og-default.png',
    siteUrl: 'https://medhinioak.dev/',
    pubDate: new Date('2026-11-01'),
  };

  it('uses the publication date as dateModified when the post was not updated', () => {
    expect(articleJsonLd(post).dateModified).toBe('2026-11-01T00:00:00.000Z');
  });

  it('uses updatedDate as dateModified when set', () => {
    const updated = { ...post, updatedDate: new Date('2026-11-10') };
    expect(articleJsonLd(updated).dateModified).toBe(
      '2026-11-10T00:00:00.000Z',
    );
  });
});

describe('jsonLdScript', () => {
  it('escapes < so a title cannot close the script element', () => {
    const json = jsonLdScript({ headline: 'Why </script><b>breaks</b>' });
    expect(json).not.toContain('<');
    expect(JSON.parse(json)).toEqual({
      headline: 'Why </script><b>breaks</b>',
    });
  });
});
