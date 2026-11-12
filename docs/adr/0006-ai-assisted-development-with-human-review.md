# ADR-0006: Use AI assistants as author and reviewers, with the owner deciding

- Status: Accepted; the automatic Gemini PR review is superseded by [ADR-0009](0009-gemini-pr-review-on-request.md)
- Date: 2026-11-10
- Decider: Medhini
- Review: Claude (project chat), 2026-11-10

## Context

The project is built solo in 8–10 hours a week. AI coding assistants make that
pace possible, but an assistant reviewing its own work misses the same things it
missed while writing. I have a Claude subscription (Claude Code, claude.ai
projects) and a Google AI Plus subscription. In June 2026 Google ended the
consumer Gemini CLI and the consumer Gemini Code Assist GitHub app; the
`run-gemini-cli` GitHub Action still works with a Gemini API key from Google AI
Studio. The repository is public and part of a job search for AI-related roles,
so how AI is used should be visible.

## Decision

- **Claude Code is the author** of code and repository files. One author per branch.
- **Reviews are independent:** `/code-review` (fresh Claude context) before every
  PR, and an automatic **Gemini PR review** (`run-gemini-cli` with an AI Studio API
  key) when every PR is opened. A Claude PR review (GitHub Action) is added once CI
  exists. Antigravity is used for deep reviews of large or risky PRs.
- **Non-code work is reviewed too:** decisions and ADRs get a second opinion from
  the other model, UI gets screenshot review and feedback from friends, blog posts
  get comment-only review. The matrix is in `docs/ai-usage.md`.
- **The owner decides** every merge, decision and published word, and supplies all
  facts about her own work.
- **AI involvement is recorded** in the PR template, commit trailers and ADR review lines.

## Alternatives considered

- **No AI** — too slow for the plan's dates.
- **One model for writing and review** — cheaper and simpler, but correlated blind spots.
- **Gemini Code Assist GitHub app** — consumer version shut down in July 2026; the
  enterprise version needs Google Cloud billing.
- **Antigravity review on every PR** — AI Plus quota is limited, so it is kept for
  large or risky changes.

## Consequences

- Every PR gets at least two reviews from two different model families before I merge.
- Review rules exist twice (`CLAUDE.md`, `GEMINI.md`) and must be changed together.
- A Gemini API key is stored as a repository secret. Free-tier usage has rate limits,
  and Google's terms for unpaid API use allow it to use inputs to improve its
  products; acceptable because the repository is public.
- Review comments add some time to each PR; required conversation resolution makes
  sure none are skipped.
- Revisit if review noise outweighs value, if quotas run out, or if a tool changes
  its terms.
