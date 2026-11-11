import { describe, expect, it } from 'vitest';
import { isCurrentPage } from './nav';

describe('isCurrentPage', () => {
  it('marks Home only on the home page', () => {
    expect(isCurrentPage('/', '/')).toBe(true);
    expect(isCurrentPage('/', '/about/')).toBe(false);
    expect(isCurrentPage('/', '/blog/a-post/')).toBe(false);
  });

  it('marks a page with or without a trailing slash', () => {
    expect(isCurrentPage('/about', '/about')).toBe(true);
    expect(isCurrentPage('/about', '/about/')).toBe(true);
  });

  it('marks Projects and Blog on their sub-pages', () => {
    expect(isCurrentPage('/projects', '/projects/a-case-study/')).toBe(true);
    expect(isCurrentPage('/blog', '/blog/a-post')).toBe(true);
    expect(isCurrentPage('/blog', '/projects/a-case-study/')).toBe(false);
  });

  it('does not match a path that only shares a prefix', () => {
    expect(isCurrentPage('/projects', '/projectsx')).toBe(false);
  });

  it('never marks Contact, even on Home', () => {
    expect(isCurrentPage('/#contact', '/')).toBe(false);
    expect(isCurrentPage('/#contact', '/about/')).toBe(false);
  });

  it('marks nothing on pages outside the nav', () => {
    for (const href of ['/', '/about', '/projects', '/blog', '/#contact']) {
      expect(isCurrentPage(href, '/impressum/')).toBe(false);
    }
  });
});
