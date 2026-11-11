# Project

Personal site and blog (Astro 6, React islands) plus a standalone game package.
Plan: docs/plan.md. Decisions: docs/adr/. Process: docs/process.md.
AI roles and reviews: docs/ai-usage.md.

# Commands

- Install: pnpm install
- Site dev server: pnpm --filter site dev
- Game playground: pnpm --filter game dev
- Tests: pnpm test (one file: pnpm vitest run path/to/file.test.ts)
- Type check: pnpm -r typecheck
- Lint: pnpm lint
- Build: pnpm build
- GitHub: use the gh CLI for issues, PRs and CI
  (gh issue view N, gh pr create --fill, gh pr checks, gh run view --log-failed)

# Rules

## Architectural Boundaries

- packages/game must never import from apps/site (lint enforces it).
  The engine (packages/game/src/engine) imports no React and no DOM.
- No third-party requests from the site: no CDN fonts, embeds, analytics or
  trackers. Links to YouTube, Twitch and so on are plain links.

## Code Quality & Engineering

- **Simplicity:** Code must be human-readable with zero over-engineering. Do not create premature abstractions or write code for hypothetical future needs.
- **Docstrings:** Write a concise one-line JSDoc comment (`/** ... */`) above every exported function, interface, type, and module boundary.
- **Strict Typing:** Declare explicit return types on all exported functions. Avoid `any`; use `unknown` with type guards.
- **Documentation-First:** Verify or draft the corresponding spec or ADR in `docs/` before implementing any new feature or architectural module.
- **Linting:** All files must strictly pass ESLint and Prettier without suppressing rules unnecessarily.

## Testing & Coverage

- Target ~80% test coverage for pure logic and engine modules (`packages/game/src/engine`).
- Focus tests on business logic, edge cases, state transitions, and entropy calculations.
- Never write trivial, low-value tests (e.g., testing simple getters or React boilerplate) solely to pad coverage metrics.

## Site & Content

- Never invent facts about the author's projects. Unknown content is written as
  PLACEHOLDER: ... and the deploy fails if it is in the built site (PRs are not blocked).
- Ensure all interactive UI components follow WCAG 2.2 AA accessibility standards (keyboard navigation, visible focus states, screen reader labels).

## Workflow & Git

- Conventional Commits. One topic per pull request.
- Work on a branch, never on main. PR bodies start with "Closes #N" and fill in
  the template's AI involvement block. Keep the Co-Authored-By trailer.
- Rules here are mirrored in GEMINI.md for the Gemini reviewer: change both together.

# Gotchas

- Astro 6 needs Node 22 or newer and uses the Content Layer API. The nvm default here
  may be older: run `nvm use` (reads .nvmrc) before pnpm.
- TypeScript stays on 6.x until typescript-eslint and @astrojs/check support 7.
- pnpm 12 blocks dependency build scripts; approve new ones with
  `pnpm approve-builds <pkg>` (writes allowBuilds) only after checking them.
- Gemini review workflow changes only take effect once merged to main.
  Problems and fixes so far: docs/troubleshooting.md.
- Colours, fonts and spacing come only from the CSS variables in
  apps/site/src/styles/global.css. A new colour pair needs a contrast row in
  docs/design/tokens.md first. Fonts are listed file by file in astro.config.mjs.
- Strip EXIF data from every photo before committing.
