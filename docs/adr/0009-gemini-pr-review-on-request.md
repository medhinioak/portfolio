# ADR-0009: Run the Gemini PR review on request only

- Status: Accepted
- Date: 2026-11-12
- Decider: Medhini
- Review: Claude Code (session discussion), 2026-11-12

## Context

ADR-0006 added an automatic Gemini PR review (`run-gemini-cli`) on every pull request.
It runs on the free tier of the Gemini API: 20 requests a day for the `gemini-3-flash`
models, and `gemini-3.8-flash` and `gemini-3-flash-preview` appear to share that quota.
One review can take up to 25 requests (`maxSessionTurns`). This repository opened 14
pull requests on 2026-11-11, so the quota can't cover every PR, and possibly not even one
whole review a day.

Three workflow fixes are merged (#8, #10), but no review has ever been posted: every
test ended on the daily quota (429) or a Google outage (503). The last test, on
2026-11-12 (issue #25, run 43127182869), authenticated, received the PR context and
called the GitHub tools before it hit the quota. The automatic review also failed on
every Dependabot PR, because Dependabot's runs don't get the repository's secrets.

## Decision

- The Gemini PR review runs **only when I ask for it** with a `@gemini-cli /review`
  comment. There is no automatic review when a PR is opened.
- I ask for it on PRs where a second model matters most: workflow and security
  changes, ADRs and other decisions, and game engine logic. One review a day fits the
  free tier.
- Every PR still needs `/code-review`, a green CI (including the `quality` job: Playwright
  smoke, axe and Lighthouse) and my own read of the full diff before I merge.
- I don't pay for a Gemini API tier.
- The on-request review is not tested again before this change. It isn't critical, so
  it is verified the first time I use it. Until then it counts as unverified.

This supersedes ADR-0006 only where it says Gemini reviews every PR automatically. The
rest of ADR-0006 stands, including the plan for a Claude PR review once CI exists.

## Alternatives considered

- **Keep the automatic review on every PR** — the free tier can't cover the number of
  PRs, so most reviews would fail with a red job and no review.
- **Pay for a Gemini API tier** — not worth the cost for a personal project.
- **Remove the Gemini review entirely** — loses a free second-model review for the few
  PRs where it matters most.
- **Gemini Code Assist GitHub app** — the consumer version shut down in July 2026, and
  the enterprise version needs Google Cloud billing (ADR-0006).

## Consequences

- Most PRs are reviewed by one model family (Claude) plus me, so correlated blind spots
  are more likely. The `quality` CI job catches a share of what a second model would
  flag on pages: accessibility, Lighthouse scores and third-party requests.
- ADR-0006's consequence "every PR gets at least two reviews from two different model
  families" no longer holds; PRs I review with Gemini still get two.
- PRs no longer get a red "Gemini Review" job when the quota is used up, and Dependabot's
  PRs no longer fail it.
- `GEMINI.md`, the API key secret and the workflows stay, so `CLAUDE.md` and `GEMINI.md`
  are still changed together.
- Revisit if an on-request review turns out not to work or not to be useful, if paying
  becomes worth it, or once a Claude PR review is added.
