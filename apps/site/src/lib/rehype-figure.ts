/** Rehype plugin: a Markdown image on its own line with a title becomes a captioned figure. */
import type { Element, ElementContent, Root } from 'hast';

/** Turns `![alt](./image.png "Caption")` on its own line into `<figure>` with a `<figcaption>`. */
export function rehypeFigure(): (tree: Root) => void {
  return (tree) => walk(tree);
}

function walk(parent: Root | Element): void {
  parent.children.forEach((child, index) => {
    if (child.type !== 'element') return;
    const figure = toFigure(child);
    if (figure) parent.children[index] = figure;
    else walk(child);
  });
}

// A <p> holding only an <img> with a title (whitespace aside) becomes a figure.
function toFigure(paragraph: Element): Element | undefined {
  if (paragraph.tagName !== 'p') return undefined;
  const content = paragraph.children.filter(
    (node) => !(node.type === 'text' && node.value.trim() === ''),
  );
  const [image] = content;
  if (content.length !== 1 || image.type !== 'element') return undefined;
  const caption = image.properties.title;
  if (image.tagName !== 'img' || typeof caption !== 'string') return undefined;

  // The caption replaces the title, so screen readers do not read it twice.
  delete image.properties.title;
  const figcaption: ElementContent = {
    type: 'element',
    tagName: 'figcaption',
    properties: {},
    children: [{ type: 'text', value: caption }],
  };
  return {
    type: 'element',
    tagName: 'figure',
    properties: {},
    children: [image, figcaption],
  };
}
