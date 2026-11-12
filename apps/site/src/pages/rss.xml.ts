/** RSS feed of the published blog posts at /rss.xml (issue #32). */
import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getPublishedPosts } from '../lib/get-posts';
import { feedTitle } from '../lib/posts';

/** Builds the feed: title, description, link and date of each post. */
export const GET: APIRoute = async ({ site }) => {
  const posts = await getPublishedPosts();
  return rss({
    title: feedTitle,
    description: 'PLACEHOLDER: one-sentence description of the blog feed',
    site: site ?? 'https://medhinioak.dev',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
    })),
  });
};
