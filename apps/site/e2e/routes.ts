/** The pages under test, read from the build so new pages are covered automatically. */
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** A page to visit and the HTTP status it should answer with. */
export interface Route {
  path: string;
  status: number;
}

const dist = fileURLToPath(new URL('../dist/', import.meta.url));

/** Turns a built HTML file path (relative to dist) into the URL path that serves it. */
function routeFor(file: string): string {
  const path = '/' + file.split('\\').join('/');
  return path.endsWith('/index.html')
    ? path.slice(0, -'index.html'.length)
    : path;
}

/** Every built page. 404.html is visited at a missing URL, so its status is checked too. */
export function builtRoutes(): Route[] {
  const files = readdirSync(dist, { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.html'))
    .sort();
  if (files.length === 0)
    throw new Error(`No HTML in ${dist}: run pnpm build first.`);
  return files.map((file) =>
    file === '404.html'
      ? { path: '/this-page-does-not-exist/', status: 404 }
      : { path: routeFor(file), status: 200 },
  );
}
