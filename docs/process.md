# How work is done here

This repository is a solo project run like a team project, so the history shows
not only what was built but how and why.

## Where things live

| What                                                   | Where                                                           |
| ------------------------------------------------------ | --------------------------------------------------------------- |
| Goals, phases, definitions of done                     | [`plan.md`](plan.md)                                            |
| Decisions and their reasons                            | [`adr/`](adr/), one file per decision                           |
| Tasks                                                  | GitHub Issues, one milestone per phase                          |
| Ideas not in the plan                                  | [`parking-lot.md`](parking-lot.md)                              |
| Launch quality gate                                    | [`launch-checklist.md`](launch-checklist.md)                    |
| Wireframes, design notes and tokens                    | [`design/`](design/), tokens in [`design/tokens.md`](design/tokens.md) |
| Releases                                               | GitHub Releases, one per phase gate (v0.1 = launch)             |
| Which AI tool does what, and how work is reviewed      | [`ai-usage.md`](ai-usage.md)                                    |
| Instructions for Claude Code / review rules for Gemini | [`../CLAUDE.md`](../CLAUDE.md) / [`../GEMINI.md`](../GEMINI.md) |
| Problems hit, their causes and fixes                   | [`troubleshooting.md`](troubleshooting.md)                      |
| How deploys work, rollback, manual deploy              | [`runbook.md`](runbook.md)                                      |

## The flow for every change

1. **Issue.** What and why, plus one line of acceptance criteria. Assign it to the phase milestone.
2. **Branch** from `main`: `feat/…`, `fix/…`, `docs/…` or `chore/…`.
3. **Plan, then build.** For anything non-trivial, plan first (Claude Code plan mode,
   or a short `SPEC.md` for larger features), then implement against checks that
   pass or fail: tests, type check, build.
4. **Pull request** using the template. The title is a
   [Conventional Commit](https://www.conventionalcommits.org/) (`feat: add RSS feed`),
   because it becomes the squash commit message. Link the issue with `Closes #12`.
5. **Checks.** CI must be green: lint, type check, tests, build, Lighthouse CI, axe.
   The deploy workflow additionally fails if the marker `PLACEHOLDER:` appears on a
   published page; pull requests are never blocked by it.
6. **Review.** Run `/code-review` before opening the PR. Gemini reviews the PR
   automatically when it is opened; ask again after changes with
   `@gemini-cli /review`. Read the full diff yourself, and fix or answer every
   comment. What each kind of work needs is in the review matrix in
   [`ai-usage.md`](ai-usage.md#review-matrix).
7. **Squash-merge.** The branch is deleted automatically; the issue closes.
8. **Decision made?** Add or update an ADR in the same pull request.

## Phase gates

At the end of each phase:

1. Tick the definition of done in `plan.md` (or record why an item was cut).
2. Review `parking-lot.md`: promote, park or drop each idea.
3. Tag a GitHub Release with a short summary of what shipped.

## Writing an ADR

Copy [`adr/0000-template.md`](adr/0000-template.md), number it next in sequence and
keep it to one page. ADRs are not edited after acceptance; a changed decision gets a
new ADR that marks the old one "Superseded by ADR-NNNN".

## Decisions made outside a PR

Decisions discussed in a chat are not final until they are an ADR merged through a
PR. Get a second opinion from the other model first (see
[`ai-usage.md`](ai-usage.md#decisions)) and record it in the ADR's "Review" line.

## Working with Claude Code

- `CLAUDE.md` holds only what cannot be read from the code: commands, rules, gotchas.
  Plans and decisions live in `docs/`; `CLAUDE.md` points to them.
- One topic per session. Run `/clear` when switching topics or after two failed corrections.
- Rules that must never be broken are enforced by tooling (lint rules, hooks, CI),
  not only by instructions.
- Personal preferences go in `CLAUDE.local.md`, which is not committed.
