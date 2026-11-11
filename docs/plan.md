# Plan

Status: active · Owner: Medhini · Last updated: 2026-11-11

This is the working plan for medhinioak.dev. It changes only through pull requests,
so its history is in git. The reasons behind the main choices are in [`adr/`](adr/).
How work moves from idea to release is in [`process.md`](process.md).

## Goal

A personal site and blog at **medhinioak.dev**, plus a small single-player game that
lives in its own package so it can become a standalone project later.

- **Audience:** friends first; followers of my YouTube and Twitch channels and
  recruiters second. Work samples and the CV are one click from the home page.
- **Feel:** personal, not commercial. A tidy game menu, not a startup landing page.

## Constraints

- Solo, 8–10 hours a week.
- Running cost under €10 a month (expected: about €2).
- Static hosting, deployed by CI/CD, infrastructure as code (Terraform, GitHub Actions).
- Fast, accessible (WCAG 2.2 AA) and search-friendly. English only.
- No third-party requests from the site: self-hosted fonts, no embeds, no analytics at launch.

## Stack

| Layer | Choice | Decision |
|---|---|---|
| Site | Astro 6 with React islands, TypeScript, Markdown blog | [ADR-0001](adr/0001-astro-with-react-islands.md) |
| Repository | pnpm monorepo; the game is its own package | [ADR-0002](adr/0002-monorepo-with-standalone-game-package.md) |
| Hosting | GitHub Pages at launch, then S3 + CloudFront + Route 53 via Terraform | [ADR-0003](adr/0003-github-pages-first-then-aws.md) |
| Privacy | No analytics, cookies or third-party requests at launch | [ADR-0004](adr/0004-no-third-party-requests-and-no-analytics-at-launch.md) |
| Game | "Guess that animal" duel on a generic deduction engine with JSON board packs | [ADR-0005](adr/0005-deduction-game-with-board-packs.md) |
| Quality | Vitest, Playwright smoke test, Lighthouse CI, axe | — |

## Launch scope

Home, About, Projects with two case studies, Blog with one post and RSS, Contact (a
section on Home with an email button and plain links to my channels, reached from the
nav), Impressum, Privacy, 404. The game page (`/play`)
ships in Phase 3, not before.

## Phases

Each phase ends at a gate. A phase that misses its gate does not get more scope;
it gets cut to its cut line.

### Phase 0: Foundations (Nov 9–12)

- [x] Register medhinioak.dev; verify it for GitHub Pages
- [x] Create the repository, licences and repository settings
- [x] Install Claude Code; add `CLAUDE.md`
- [ ] Add `docs/` (this plan, process, ADRs, launch checklist, parking lot)
- [ ] Scaffold the pnpm workspace, Astro site and empty game package
- [ ] Theme tokens, light and dark mode, self-hosted fonts
- [ ] CI (install, lint, type check, test, build) and deploy to GitHub Pages
- [x] Low-fidelity wireframes for Home, About, a case study, a blog post and 404 in `docs/design/` (time-box: 2 hours)

**Done when:** a styled, mostly empty page is live at the github.io address, the theme
toggle works without a flash, and CI is green.

### Phase 1: Content and launch (Nov 13–22)

- [ ] Home, About, Projects and two case studies (one template for all case studies)
- [ ] Blog with RSS, and Post 1: "Building my portfolio site in two weeks"
- [ ] Impressum and privacy policy
- [ ] SEO basics: titles, descriptions, canonical URLs, sitemap, Open Graph images
- [ ] Work through [`launch-checklist.md`](launch-checklist.md); point medhinioak.dev at GitHub Pages and enforce HTTPS
- [ ] Link the site from CV, LinkedIn and GitHub profile

**Done when:** the site is live on medhinioak.dev over HTTPS; Lighthouse (mobile) is
at least 95 in all four categories on Home and a post; axe reports no serious or
critical issues; every "must" item in the launch checklist is ticked.

**Cut line:** if the second case study is not drafted by Nov 19, launch with one.

### Phase 2: AWS and Terraform (Nov 23 – Dec 6)

- [ ] AWS account on the Paid plan, root MFA, budget alerts at €5 and €8
- [ ] `infra/bootstrap` (state bucket, GitHub OIDC role), then `infra/site`
- [ ] Test on the CloudFront address, then move DNS; keep GitHub Pages for a week as fallback
- [ ] Deploy workflow syncs to S3 and invalidates CloudFront; `infra-plan.yml` on infra PRs
- [ ] `docs/architecture.md` and `docs/runbook.md`
- [ ] Post 2: "From GitHub Pages to AWS with Terraform for about $2 a month"

**Done when:** the stack can be destroyed and recreated from the repository; the site
is served by CloudFront with HTTPS and HSTS; a push to `main` deploys with no stored
AWS keys; a test budget alert arrived; the first month's forecast is under €5.

**Cut line:** if Terraform does not work by Dec 3, stay on GitHub Pages, move the rest
to January and start the game.

### Phase 3: The game (Dec 7–27, hard stop Jan 10)

- [ ] Week 1: board pack schema, deduction engine with tests, computer question picker, first 16 animals
- [ ] Week 2: React + SVG interface, a full round, two difficulties
- [ ] Week 3: keyboard and screen-reader play, phone layout, playground, package README, `/play`
- [ ] Post 3: "How a computer picks which question to ask"

**Checkpoint (about 10 hours in):** if a complete round is not playable, cut to 16
animals and two difficulties.

**Done when:** the game is playable on desktop, phone and keyboard alone; the engine
has unit tests; `pnpm --filter game dev` runs it without the site; `/play` is live.

**Hard stop:** if it is not live by Jan 10, publish what exists with an honest README.

### Phase 4: Polish (January, optional)

- [ ] Decide on analytics; update the privacy policy before adding anything
- [ ] Third case study, Search Console, repository mirror, renewal reminders

**Done when:** the analytics decision is recorded, the third case study is live and a
restore from the mirror has been tested once.

## Non-goals

| Not doing | Why not now | Revisit |
|---|---|---|
| Prompt-generated game boards | Needs a backend, LLM spend, moderation, image licensing | After the game is extracted |
| Accounts, saved progress, leaderboards | Needs a database, login and a longer privacy policy | After Phase 4, only with a reason |
| Multiplayer | Out of scope; needs servers and moderation | Not planned |
| Comments, newsletter, form backend | Each collects personal data; `mailto:` is enough | Phase 4 at the earliest |
| CMS or database | Markdown in git is cheaper and portable | Not planned |
| German translation | Doubles every edit | Not planned |
| Containers, Kubernetes, Lambda, multi-region | A static site needs none of them | As a separate project |
| Third-party fonts, embeds, trackers | Send visitors' IP addresses to third parties | Never without consent |
| Framework or hosting switch after Phase 1 | Rebuilding hides unfinished work | Not planned |

## Working rules

1. **Parking lot.** New ideas go to [`parking-lot.md`](parking-lot.md), not into the code. Review at each phase gate.
2. **Two-hour rule.** Nothing over two hours enters a running phase unless it replaces something of equal size.
3. **One thing in progress.** Finish the current page or feature before starting another.
4. **Launch beats polish.** A published case study beats a better animation.
5. **Cut scope, not quality.** When a phase slips, use its cut line.
