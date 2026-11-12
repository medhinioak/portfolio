# AI usage and review

This project is built with AI assistants under human control. This page says which
tool does what, how every kind of work is reviewed, and how that is recorded.
The decision behind it is [ADR-0006](adr/0006-ai-assisted-development-with-human-review.md).

## Principles

1. **One author per change.** A branch has one AI author at a time. Reviewers comment; they do not push.
2. **Independent review.** At least one reviewer that did not produce the work, ideally a different model.
3. **The owner decides.** Every merge, published word and decision is approved by me.
4. **Rules live in tooling.** Anything that must never break is enforced by lint, tests or CI, not only by instructions to an AI.
5. **Facts come from me.** No AI invents facts about my projects, results or experience (see `CLAUDE.md`).
6. **Recorded, not hidden.** AI involvement is visible in pull requests, commit trailers and this page.
7. **Nothing private goes in.** No secrets, personal data or private notes are given to any tool that does not need them.

## Which tool for what

| Tool | Role | Use it for | Not for |
|---|---|---|---|
| **Claude Code** (local CLI) | Author | Anything that changes files: scaffolding, features, fixes, tests, ADR and doc files, opening PRs, reading CI failures with `gh` | Final decisions; facts about my work |
| **Claude, Portfolio project chat** (claude.ai) | Thinking partner | Decisions and trade-offs, phase planning, feature specs, drafts of posts and page copy, interview framing | Editing the repository |
| **Claude Design** (claude.ai) | Wireframing | Low-fidelity layouts and page mockups for review, in light and dark; exported as PNGs into `docs/design/` | Editing the repository; final copy |
| **`/code-review` in Claude Code** | Reviewer 1 (fresh context) | Self-check of every branch before the PR is opened | Replacing an independent review |
| **Claude PR review** (GitHub Action, planned) | Reviewer 2 | Automatic inline review on PRs; `@claude` for follow-up questions | Pushing commits to someone else's branch |
| **Gemini PR review** (`run-gemini-cli` GitHub Action) | Independent reviewer (different model) | Automatic review when a PR is opened (not Dependabot's PRs); `@gemini-cli /review <focus>` to re-run with a focus | Writing code |
| **Gemini app** (Google AI Plus) | Second opinion | Decisions, ADR drafts, UI screenshots and wireframes, blog drafts | Anything containing private notes |
| **Antigravity** (Google AI Plus, limited quota) | Deep reviewer | Optional local review of large or risky PRs (game engine, Terraform, deploy workflows) | Routine PRs |
| **Friends** (primary audience) | Human reviewers | UI and copy: "does this feel like me, is it clear, does it work on your phone?" | Code |

## Review matrix

What each kind of work needs before it is accepted. "Required" means the PR is not
merged without it.

| Work | Required | Recommended | Where it is recorded |
|---|---|---|---|
| Code (site, game) | CI green, `/code-review`, Gemini PR review, my read of the diff | Claude PR review; Antigravity for engine changes | PR checks and comments |
| Infrastructure (Terraform, workflows) | As code, plus `terraform plan` output in the PR | Antigravity review focused on security and cost | PR comments |
| Docs and ADRs | Gemini PR review, my read | Claude PR review | PR comments |
| Decisions (before an ADR exists) | Discussed in a project chat; second opinion from the Gemini app | Ask each model to argue the opposite option | The ADR's "Review" line |
| UI and design | Lighthouse and axe in CI; contrast and keyboard check | Screenshots reviewed in the Gemini app; two friends try it on their phones | PR description (screenshots + feedback summary) |
| Blog posts and page copy | My own voice; facts checked by me | AI comments on clarity and structure only, never a rewrite | PR comments |

## How to run each review

### Code, docs and ADRs (every PR)

1. Before opening the PR: run `/code-review` in Claude Code and fix what is valid.
2. Open the PR. Gemini reviews automatically when the PR is opened.
3. After further pushes, ask again with a comment: `@gemini-cli /review` (add a focus, for example `@gemini-cli /review focus on accessibility`).
4. Answer every comment: fix it, or reply why not. The ruleset requires all conversations to be resolved before merging.
5. Tick the "AI involvement" box in the PR template.

### Decisions

1. Discuss options in a Portfolio project chat; ask for the strongest case against the preferred option.
2. Paste the draft ADR into the Gemini app with:
   > Review this architecture decision record for a solo developer's portfolio site. List the two weakest points, any missing alternative, and any consequence I have not stated. Do not rewrite it.
3. Add a line to the ADR: `Review: Claude (project chat), Gemini (app), YYYY-MM-DD`.
4. Commit the ADR through a PR as usual.

### UI and design

1. Attach light- and dark-mode screenshots (desktop and phone) to the PR description.
2. Ask the Gemini app:
   > Review these screenshots of a personal site for friends and recruiters. Check hierarchy, readability, contrast, touch targets and whether it feels personal rather than commercial. List concrete issues by severity.
3. Before launch and for major layout changes, ask two friends to try the page on their phones; summarise their feedback in the PR.

### Blog posts and page copy

1. I write the draft.
2. Ask Claude or Gemini to comment only:
   > Comment on clarity, structure and anything a reader might misunderstand. Quote the sentence for each point. Do not rewrite the text.
3. I check every fact myself before publishing.

## Recording AI involvement

- **Pull requests:** the template's "AI involvement" block lists the author and reviewers.
- **Commits:** Claude Code adds a `Co-Authored-By` trailer; keep it.
- **ADRs:** a "Review" line names who reviewed the decision.
- **This page:** updated when a tool or the process changes, through a PR like any other change.

## Setup notes

- **Gemini PR review** runs Google's `run-gemini-cli` action (`.github/workflows/gemini-dispatch.yml`
  and `gemini-review.yml`). It needs a repository secret `GEMINI_API_KEY` from Google AI Studio.
  The key is separate from the Google AI Plus subscription. Review rules for Gemini are in `GEMINI.md`.
  Reviews run only for PRs from this repository, not from forks, and comment commands only from the owner or collaborators.
  - The key is on the free tier, so the repository variable `GEMINI_MODEL` selects a model with a free tier
    (`gemini-3-flash-preview`). Keep re-runs few: one review can take up to 25 requests.
  - `gemini-review.yml` differs from Google's example in two places: a 15-minute timeout, and
    `tools.core` allowlisting `activate_skill` and `mcp_github_*` (the example's empty list disables the GitHub tools).
  - A green run is not proof of a review. `UPLOAD_ARTIFACTS=true` keeps Gemini's output as a run artifact;
    see [`troubleshooting.md`](troubleshooting.md#gemini-pr-review) for how to diagnose a run.
  - Workflow changes take effect only once merged: comment-triggered runs use the files on `main`.
- **Claude PR review** is set up with `/install-github-app` in Claude Code once CI exists.
- **Keep `CLAUDE.md` and `GEMINI.md` in step.** When a rule changes in one, change it in the other in the same PR.
