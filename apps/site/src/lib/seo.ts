/** Head metadata helpers: site name, Open Graph image and JSON-LD structured data (pure, no Astro imports). */

/** The site name: the end of every title and `og:site_name` (owner, issue #34). */
export const siteName = 'Medhini Oak';

/** The job title in the Person structured data on Home (owner, issue #34). */
export const jobTitle = 'Software engineer';

/** The default Open Graph image, 1200 × 630, rendered from og/og-default.html. */
export const ogImage = {
  path: '/og-default.png',
  width: 1200,
  height: 630,
  alt: 'Medhini Oak, software engineer, medhinioak.dev',
} as const;

/** A JSON-LD object (schema.org vocabulary). */
export type JsonLd = Record<string, unknown>;

/** JSON-LD for the site owner on Home; `sameAs` lists the profile links. */
export function personJsonLd(
  siteUrl: string,
  sameAs: readonly string[],
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteName,
    jobTitle,
    url: siteUrl,
    sameAs,
  };
}

/** The fields of a blog post that its Article JSON-LD needs. */
export interface ArticleFields {
  title: string;
  description: string;
  url: string;
  image: string;
  siteUrl: string;
  pubDate: Date;
  updatedDate?: Date;
}

/** JSON-LD for a blog post; `dateModified` falls back to the publication date. */
export function articleJsonLd(post: ArticleFields): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    url: post.url,
    mainEntityOfPage: post.url,
    image: post.image,
    datePublished: post.pubDate.toISOString(),
    dateModified: (post.updatedDate ?? post.pubDate).toISOString(),
    author: { '@type': 'Person', name: siteName, url: post.siteUrl },
  };
}

/** JSON for an inline `<script type="application/ld+json">`: `<` is escaped so text cannot close the tag. */
export function jsonLdScript(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
