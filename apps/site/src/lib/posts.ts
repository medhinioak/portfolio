/** Blog post helpers: draft filtering, newest-first order, reading time and dates (pure, no Astro imports). */

/** Title of the RSS feed, also used in the head's alternate link. */
export const feedTitle = 'Medhini Oak: Blog';

/** The fields of a post the list helpers need. */
export interface DatedEntry {
  id: string;
  data: { pubDate: Date; draft: boolean };
}

/** Posts to build, newest first (ties by id); drafts only when `dev` is true. */
export function publishedNewestFirst<T extends DatedEntry>(
  entries: readonly T[],
  dev: boolean,
): T[] {
  return entries
    .filter((entry) => dev || !entry.data.draft)
    .toSorted(
      (a, b) =>
        b.data.pubDate.getTime() - a.data.pubDate.getTime() ||
        a.id.localeCompare(b.id),
    );
}

const wordsPerMinute = 200;

// A fence line (``` or ~~~, with or without a language) is Markdown syntax, not a word.
const fenceLine = /^\s*(`{3,}|~{3,})/;
// HTML comments are notes to the author, never shown.
const htmlComment = /<!--[\s\S]*?-->/g;

/** Minutes to read a Markdown body: words ÷ 200, rounded up, at least 1. Code counts like prose. */
export function readingMinutes(markdown: string): number {
  const words = markdown
    .replace(htmlComment, ' ')
    .split('\n')
    .filter((line) => !fenceLine.test(line))
    .join(' ')
    .split(/\s+/)
    .filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** A post date as "12 November 2026". Front-matter dates are UTC midnight, so UTC is used. */
export function formatPostDate(date: Date): string {
  return dateFormat.format(date);
}

/** The date for `<time datetime>`: "2026-11-12". */
export function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}
