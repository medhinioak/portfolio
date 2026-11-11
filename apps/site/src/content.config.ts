/** Content collections (Content Layer API, ADR-0001): case studies in src/content/projects. */
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

export const collections = { projects };
