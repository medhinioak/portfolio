/** Loads the case studies to build, in order (drafts in dev only). */
import { getCollection, type CollectionEntry } from 'astro:content';
import { publishedInOrder } from './projects';

/** Published case studies, lower `order` first; drafts are included in `astro dev`. */
export async function getPublishedProjects(): Promise<
  CollectionEntry<'projects'>[]
> {
  return publishedInOrder(await getCollection('projects'), import.meta.env.DEV);
}
