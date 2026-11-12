import { describe, expect, it } from 'vitest';
import { articleJsonLd, jsonLdScript } from './seo';

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
