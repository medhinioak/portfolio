# portfolio

Source of [medhinioak.dev](https://medhinioak.dev): a personal site and blog, plus
**Tail Trail**, a small single-player game that lives in its own package and is played
on the site at [`/play`](https://medhinioak.dev/play/).

> Work in progress. The plan and its current phase are in [`docs/plan.md`](docs/plan.md).

## Tech stack

| Part | Built with |
|---|---|
| Site | [Astro 7](https://astro.build/) with React islands, TypeScript, Markdown blog with RSS |
| Game | React + SVG interface on a plain TypeScript deduction engine with JSON board packs |
| Repository | pnpm workspace (monorepo); the game never imports from the site |
| Quality | Vitest, Playwright (smoke, axe accessibility, keyboard), Lighthouse CI, ESLint, Prettier |
| Hosting | GitHub Pages, deployed by GitHub Actions on every merge to `main` |

The reasons behind each choice are in [`docs/adr/`](docs/adr/) and the stack table in
[`docs/plan.md`](docs/plan.md#stack).

## Project structure

```text
apps/site/           The Astro site
  src/pages/         One file per route (/, /about, /blog, /play, …)
  src/content/       Blog posts and project case studies (Markdown)
  src/styles/        global.css: every colour, font and spacing token
  e2e/               Playwright tests against the built site
packages/game/       Tail Trail, a standalone package
  src/engine/        Rules and the computer player: plain TypeScript, no React, no DOM
  src/ui/            React components
  src/boards/        Board packs (JSON) and sprites
  playground/        A page to run the game without the site
  tools/sprites/     Turns drawn sprites into 32 x 32 SVG
  e2e/               Playwright tests against the playground
docs/                Plan, ADRs, process, design, game spec, runbook
```

## Running it locally

### Requirements

- **Node.js 22.23.4 or newer.** With [nvm](https://github.com/nvm-sh/nvm), run `nvm use`
  in the repository root (it reads `.nvmrc`); check with `node --version`.
- **pnpm 12.** The exact version is pinned in `package.json` (`packageManager`), so
  `corepack enable` sets it up for you.

### Set up

```sh
git clone https://github.com/medhinioak/portfolio.git
cd portfolio
nvm use
pnpm install
```

pnpm 12 blocks dependency build scripts by default. The ones the project needs are
already allowed in `pnpm-workspace.yaml`.

### Start the site

```sh
pnpm --filter site dev
```

Open <http://localhost:4321>. The game is at <http://localhost:4321/play/>.

### Start the game on its own

```sh
pnpm --filter game dev
```

Open the address Vite prints (usually <http://localhost:5173>). Add `?seed=anything` to
the URL to get the same computer animal and moves every time. The sprite contact sheet is
at `/contact-sheet.html`.

### Build and preview the site

```sh
pnpm build                                 # output in apps/site/dist
pnpm --filter site exec astro preview      # serve the build locally
```

## Commands

Run these from the repository root.

| Command | What it does |
|---|---|
| `pnpm --filter site dev` | Site dev server |
| `pnpm --filter game dev` | Game playground |
| `pnpm build` | Build the site |
| `pnpm test` | All unit tests (Vitest) |
| `pnpm vitest run path/to/file.test.ts` | One test file |
| `pnpm test:coverage` | Unit tests with coverage |
| `pnpm typecheck` | Type check every package |
| `pnpm lint` | ESLint and Prettier check |
| `pnpm format` | Fix formatting with Prettier |
| `pnpm --filter site test:e2e` | Site end-to-end tests (run `pnpm build` first) |
| `pnpm --filter game test:e2e` | Game end-to-end tests (builds the playground itself) |
| `pnpm exec lhci autorun` | Lighthouse CI against the built site |

### End-to-end tests

The Playwright tests need Chromium. Install it once:

```sh
pnpm --filter site exec playwright install chromium
```

If the site tests stop with "webServer exited early", start the preview yourself first
and leave it running while the tests run:

```sh
pnpm --filter site exec astro preview --host 127.0.0.1 --port 4310
```

## Deployment

Every merge to `main` builds the site and deploys it to GitHub Pages. The deploy fails
if a page still contains the marker `PLACEHOLDER:`. Rollback and manual deploys are in
the [runbook](docs/runbook.md).

## Contributing

This is a solo project run like a team project. Every change starts as an issue, is
built on a branch (`feat/…`, `fix/…`, `docs/…`, `chore/…`) and lands through a pull
request whose title is a [Conventional Commit](https://www.conventionalcommits.org/).
CI must pass: lint, type check, tests, build, Lighthouse and axe. The full flow is in
[`docs/process.md`](docs/process.md). Known problems and their fixes are in
[`docs/troubleshooting.md`](docs/troubleshooting.md).

## Documentation

| Read this | For |
|---|---|
| [`docs/plan.md`](docs/plan.md) | Goals, phases, definitions of done, non-goals |
| [`docs/adr/`](docs/adr/) | Why the main technical choices were made |
| [`docs/process.md`](docs/process.md) | How a change goes from issue to release |
| [`docs/game/spec.md`](docs/game/spec.md) | Tail Trail's rules, screens, keyboard and screen-reader behaviour |
| [`docs/design/`](docs/design/) | Wireframes, design tokens and contrast checks |
| [`docs/runbook.md`](docs/runbook.md) | How deploys work, rollback, manual deploy |
| [`docs/ai-usage.md`](docs/ai-usage.md) | Which AI tool does what, and how work is reviewed |
| [`docs/launch-checklist.md`](docs/launch-checklist.md) | The quality gate before launch |

## How this was built

Built solo with AI assistants under human review: Claude Code writes code on a branch,
every pull request gets a fresh-context Claude review, CI checks and my own review,
Gemini reviews riskier changes on request, and every merge and decision is mine.
Details in [`docs/ai-usage.md`](docs/ai-usage.md),
[ADR-0006](docs/adr/0006-ai-assisted-development-with-human-review.md) and
[ADR-0009](docs/adr/0009-gemini-pr-review-on-request.md).

## Licence

Code: MIT (see [`LICENSE`](LICENSE)). Content and artwork: all rights reserved
(see [`CONTENT-LICENSE.md`](CONTENT-LICENSE.md)).
