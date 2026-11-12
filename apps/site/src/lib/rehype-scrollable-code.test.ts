import type { Element, Root } from 'hast';
import { describe, expect, it } from 'vitest';
import { rehypeScrollableCode } from './rehype-scrollable-code';

const el = (tagName: string, ...children: Element[]): Element => ({
  type: 'element',
  tagName,
  properties: {},
  children,
});

describe('rehypeScrollableCode', () => {
  it('makes code blocks focusable, also when nested, and leaves other elements alone', () => {
    const top = el('pre', el('code'));
    const nested = el('pre', el('code'));
    const paragraph = el('p', el('code'));
    const tree: Root = {
      type: 'root',
      children: [top, el('blockquote', nested), paragraph],
    };
    rehypeScrollableCode()(tree);
    expect(top.properties.tabIndex).toBe(0);
    expect(nested.properties.tabIndex).toBe(0);
    expect(paragraph.properties.tabIndex).toBeUndefined();
  });
});
