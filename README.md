# portfolio

Source of [medhinioak.dev](https://medhinioak.dev): a personal site and blog, plus a
small single-player game that lives in its own package.

> Work in progress. The plan and its current phase are in [`docs/plan.md`](docs/plan.md).

## Documentation

| Read this | For |
|---|---|
| [`docs/plan.md`](docs/plan.md) | Goals, phases, definitions of done, non-goals |
| [`docs/adr/`](docs/adr/) | Why the main technical choices were made |
| [`docs/process.md`](docs/process.md) | How a change goes from issue to release |
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
