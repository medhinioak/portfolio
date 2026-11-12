/** Content collections (Content Layer API, ADR-0001): case studies and blog posts. */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Case studies. Files starting with an underscore (the template) are skipped. */
const projects = defineCollection({
  loader: glob({ pattern: '[^_]*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** One or two sentences, shown under the title and on cards. */
      summary: z.string(),
      role: z.string(),
      /** Shown on cards ("role, year"). */
      year: z.number().int(),
      /** Shown in the details box, for example "4 months, 2025". */
      timeframe: z.string(),
      team: z.string(),
      /** Course, university or employer. */
      context: z.string(),
      stack: z.array(z.string()),
      codeUrl: z.url(),
      demoUrl: z.url().optional(),
      hero: z
        .object({
          image: image(),
          alt: z.string(),
          caption: z.string().optional(),
        })
        .optional(),
      /** Lower comes first on Home, on /projects and in previous/next. */
      order: z.number(),
      /** Drafts are built in dev only. */
      draft: z.boolean().default(false),
    }),
});

/** Blog posts in src/content/blog; the file name is the slug. */
const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** One or two sentences: the summary under the title, also for SEO and RSS. */
      description: z.string(),
      /** Date only (YYYY-MM-DD): it is read as UTC midnight and shown as that day. */
      pubDate: z.coerce.date(),
      /** Date only, like pubDate. */
      updatedDate: z.coerce.date().optional(),
      tags: z.array(z.string()),
      cover: z.object({ image: image(), alt: z.string() }).optional(),
      /** Drafts are built in dev only. */
      draft: z.boolean().default(false),
    }),
});

export const collections = { projects, blog };
