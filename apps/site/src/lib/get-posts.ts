/** Loads the blog posts to build, newest first (drafts in dev only). */
import { getCollection, type CollectionEntry } from 'astro:content';
import { publishedNewestFirst } from './posts';

/** Published posts, newest first; drafts are included in `astro dev`. */
export async function getPublishedPosts(): Promise<CollectionEntry<'blog'>[]> {
  return publishedNewestFirst(await getCollection('blog'), import.meta.env.DEV);
}
