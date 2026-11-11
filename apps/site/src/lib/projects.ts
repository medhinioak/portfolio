/** Ordering, draft filtering and previous/next for case studies (pure, no Astro imports). */

/** The fields of a case study the list helpers need. */
export interface OrderedEntry {
  id: string;
  data: { order: number; draft: boolean };
}

/** Entries to build, lower `order` first (ties by id); drafts only when `dev` is true. */
export function publishedInOrder<T extends OrderedEntry>(
  entries: readonly T[],
  dev: boolean,
): T[] {
  return entries
    .filter((entry) => dev || !entry.data.draft)
    .toSorted(
      (a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id),
    );
}

/** The entries before and after `id` in `list`; both are undefined when it is the only one. */
export function neighbours<T extends { id: string }>(
  list: readonly T[],
  id: string,
): { previous?: T; next?: T } {
  const index = list.findIndex((entry) => entry.id === id);
  if (index === -1) return {};
  return { previous: list[index - 1], next: list[index + 1] };
}
