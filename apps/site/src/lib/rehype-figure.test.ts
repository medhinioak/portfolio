import type { Element, ElementContent, Root } from 'hast';
import { describe, expect, it } from 'vitest';
import { rehypeFigure } from './rehype-figure';

const img = (title?: string): Element => ({
  type: 'element',
  tagName: 'img',
  properties: { src: './figure.png', alt: 'A diagram', title },
  children: [],
});

const p = (...children: ElementContent[]): Element => ({
  type: 'element',
  tagName: 'p',
  properties: {},
  children,
});

const text = (value: string): ElementContent => ({ type: 'text', value });

function run(...children: Element[]): Root {
  const tree: Root = { type: 'root', children };
  rehypeFigure()(tree);
  return tree;
}

describe('rehypeFigure', () => {
  it('wraps an image with a title in a figure with that caption', () => {
    const [figure] = run(p(text('\n'), img('What the figure shows'))).children;
    expect(figure).toMatchObject({
      tagName: 'figure',
      children: [
        { tagName: 'img', properties: { alt: 'A diagram' } },
        {
          tagName: 'figcaption',
          children: [{ type: 'text', value: 'What the figure shows' }],
        },
      ],
    });
    expect((figure as Element).children[0]).not.toHaveProperty(
      'properties.title',
    );
  });

  it('leaves an image without a title as it is', () => {
    const [node] = run(p(img())).children;
    expect(node).toMatchObject({ tagName: 'p' });
  });

  it('leaves an image with an empty title as it is', () => {
    const [node] = run(p(img('  '))).children;
    expect(node).toMatchObject({ tagName: 'p' });
  });

  it('leaves an image inside running text as it is', () => {
    const [node] = run(p(text('See '), img('Caption'))).children;
    expect(node).toMatchObject({ tagName: 'p' });
  });

  it('finds images nested deeper, for example in a list', () => {
    const li: Element = {
      type: 'element',
      tagName: 'li',
      properties: {},
      children: [p(img('Nested'))],
    };
    const [list] = run(li).children;
    expect((list as Element).children[0]).toMatchObject({ tagName: 'figure' });
  });
});
