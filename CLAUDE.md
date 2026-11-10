# Project

Personal site and blog (Astro 6, React islands) plus a standalone game package.
Plan: docs/plan.md. Decisions: docs/adr/.

# Commands

- Install: pnpm install
- Site dev server: pnpm --filter site dev
- Game playground: pnpm --filter game dev
- Tests: pnpm test (one file: pnpm vitest run path/to/file.test.ts)
- Type check: pnpm -r typecheck
- Lint: pnpm lint
- Build: pnpm build

# Rules

- packages/game must never import from apps/site (lint enforces it).
  The engine (packages/game/src/engine) imports no React and no DOM.
- No third-party requests from the site: no CDN fonts, embeds, analytics or
  trackers. Links to YouTube, Twitch and so on are plain links.
- Never invent facts about the author's projects. Unknown content is written as
  PLACEHOLDER: ... and the production build fails if it is published.
- Conventional Commits. One topic per pull request.

# Gotchas

- Astro 6 needs Node 22 or newer and uses the Content Layer API.
- Strip EXIF data from every photo before committing.
