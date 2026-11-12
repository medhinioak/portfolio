/** Rehype plugin: code blocks can be scrolled sideways with the keyboard. */
import type { Element, Root } from 'hast';

/** Makes every `<pre>` a named, focusable region, so keyboard users can scroll it and screen readers announce it. */
export function rehypeScrollableCode(): (tree: Root) => void {
  return (tree) => walk(tree);
}

function walk(parent: Root | Element): void {
  for (const child of parent.children) {
    if (child.type !== 'element') continue;
    if (child.tagName === 'pre') {
      child.properties.tabIndex = 0;
      child.properties.role = 'region';
      child.properties.ariaLabel = 'Code sample';
    } else walk(child);
  }
}
