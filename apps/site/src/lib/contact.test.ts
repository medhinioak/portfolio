import { describe, expect, it } from 'vitest';
import { mailtoHref } from './contact';

describe('mailtoHref', () => {
  it('encodes characters that would break the query', () => {
    expect(mailtoHref('me@example.com', 'Hi & hello? 100%')).toBe(
      'mailto:me@example.com?subject=Hi%20%26%20hello%3F%20100%25',
    );
  });

  it('encodes non-ASCII text', () => {
    expect(mailtoHref('me@example.com', 'Grüße')).toBe(
      'mailto:me@example.com?subject=Gr%C3%BC%C3%9Fe',
    );
  });

  it('leaves out an empty subject', () => {
    expect(mailtoHref('me@example.com')).toBe('mailto:me@example.com');
  });
});
