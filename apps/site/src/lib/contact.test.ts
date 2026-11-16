import { describe, expect, it } from 'vitest';
import { mailtoHref, telHref } from './contact';

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

describe('telHref', () => {
  it('strips the spaces used for reading', () => {
    expect(telHref('+49 30 1234 5678')).toBe('tel:+493012345678');
  });

  it('strips tabs and repeated spaces too', () => {
    expect(telHref(' +49\t30  12 ')).toBe('tel:+493012');
  });
});
