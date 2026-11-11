# ADR-0001: Use Astro 6 with React islands for the site

- Status: Accepted; version superseded by [ADR-0008](0008-upgrade-to-astro-7.md)
- Date: 2026-11-10
- Decider: Medhini

## Context

The site is mostly static content: pages, case studies and a Markdown blog. It must
be fast, accessible and search-friendly, and deploy as static files. One page will
host an interactive React game. React and TypeScript are my preferred tools.

## Decision

Use Astro 6 with TypeScript. Blog posts are Markdown files typed with the Content
Layer API. Interactive parts (theme toggle, game) are React islands, hydrated only
where they are used.

## Alternatives considered

- **Next.js 16** — more common in job ads, but brings a server-oriented model this
  static site does not need, and ships more JavaScript by default.
- **Vite + React single-page app** — weak for SEO and for content pages.
- **A headless CMS** — another service to host or pay for; Markdown in git is enough.

## Consequences

- Content pages ship close to zero JavaScript; high Lighthouse scores need little tuning.
- React and TypeScript skills still apply inside islands.
- Astro 6 requires Node 22 or newer.
- Astro is less common in job ads than Next.js. Revisit if the site needs accounts or
  server features, which are non-goals for now.
