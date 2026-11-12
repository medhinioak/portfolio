/** Rehype plugin: code blocks can be scrolled sideways with the keyboard. */
import type { Element, Root } from 'hast';

/** Adds `tabindex="0"` to every `<pre>`, so keyboard users can focus and scroll it. */
export function rehypeScrollableCode(): (tree: Root) => void {
  return (tree) => walk(tree);
}

function walk(parent: Root | Element): void {
  for (const child of parent.children) {
    if (child.type !== 'element') continue;
    if (child.tagName === 'pre') child.properties.tabIndex = 0;
    else walk(child);
  }
}
