# ADR-0002: Use a pnpm monorepo with the game as a standalone package

- Status: Accepted
- Date: 2026-11-10
- Decider: Medhini

## Context

The game will become its own project later. Until then it is developed alongside the
site and shown on it. Extracting it later must not require untangling it from site code.

## Decision

One repository with a pnpm workspace:

- `apps/site` — the Astro site
- `packages/game` — the game, with its own tests, README and playground
- `infra/` — Terraform

Rules:

1. Imports go one way: the site imports the game only through `packages/game/src/index.ts`.
   The game never imports from the site. A lint rule enforces this.
2. The game engine (`packages/game/src/engine`) imports no React and no DOM.
3. The game has no site concerns: no routing, analytics or browser storage. It exposes
   callbacks and the site decides what to do with them.
4. The site themes the game through `--game-*` CSS custom properties.
5. Engine, UI and boards stay folders in one package until a second consumer appears.

## Alternatives considered

- **Game inside the site's source tree** — fastest to start, expensive to extract.
- **Separate repositories now** — versioning and publishing overhead before there is a need.
- **Three packages (engine, UI, boards)** — more setup with no current benefit.

## Consequences

- `pnpm --filter game dev` and `pnpm --filter game test` work without the site.
- Extraction is `git subtree split --prefix=packages/game`, keeping the history.
- Some workspace setup cost up front.
