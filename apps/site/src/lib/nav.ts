/** Navigation links and the rule for which one marks the current page. */

/** A link in the header nav, the phone drawer or the footer. */
export interface NavItem {
  label: string;
  href: string;
}

/**
 * True if `href` is the nav item for the page at `pathname` (docs/design/wireframes.md).
 * Home matches only `/`; a section links such as `/#contact` never match; other items
 * match their own path and every page below it.
 */
export function isCurrentPage(href: string, pathname: string): boolean {
  if (href.includes('#')) return false;
  const path = trimSlash(pathname);
  const target = trimSlash(href);
  if (target === '') return path === '';
  return path === target || path.startsWith(`${target}/`);
}

function trimSlash(path: string): string {
  return path.replace(/\/+$/, '');
}
