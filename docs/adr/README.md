# Architecture Decision Records

One file per significant decision, numbered in order. Accepted ADRs are not edited;
a changed decision gets a new ADR that supersedes the old one.
Start from [`0000-template.md`](0000-template.md).

| ADR                                                                | Decision                                                           | Status                                     |
| ------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------ |
| [0001](0001-astro-with-react-islands.md)                           | Use Astro 6 with React islands for the site                        | Accepted; version superseded by 0008       |
| [0002](0002-monorepo-with-standalone-game-package.md)              | Use a pnpm monorepo with the game as a standalone package          | Accepted                                   |
| [0003](0003-github-pages-first-then-aws.md)                        | Launch on GitHub Pages, then move to AWS with Terraform            | Accepted                                   |
| [0004](0004-no-third-party-requests-and-no-analytics-at-launch.md) | No third-party requests and no analytics at launch                 | Accepted                                   |
| [0005](0005-deduction-game-with-board-packs.md)                    | Build a "guess that animal" deduction game on board packs          | Accepted                                   |
| [0006](0006-ai-assisted-development-with-human-review.md)          | Use AI assistants as author and reviewers, with the owner deciding | Accepted; Gemini review superseded by 0009 |
| [0007](0007-phone-navigation-drawer.md)                            | Use a left drawer for phone navigation                             | Accepted                                   |
| [0008](0008-upgrade-to-astro-7.md)                                 | Upgrade the site to Astro 7                                        | Proposed                                   |
| [0009](0009-gemini-pr-review-on-request.md)                        | Run the Gemini PR review on request only                           | Accepted                                   |
| [0010](0010-no-syntax-highlighting-at-launch.md) | Show code blocks without syntax highlighting at launch | Proposed |
| [0011](0011-build-the-game-before-the-aws-move.md) | Build the game before the AWS move | Accepted |
| [0012](0012-game-art-is-ai-assisted-pixel-art-edited-by-the-owner.md) | Make the game art as AI-assisted pixel art, edited by the owner | Accepted |
| [0013](0013-players-ask-from-a-fixed-list-of-questions-with-a-filter.md) | Players ask from a fixed list of questions, with a filter | Accepted |
| [0014](0014-sprites-are-32-by-32-png-masters-exported-to-svg.md) | Keep sprites as 32 × 32 PNG masters and export them to SVG | Proposed |
| [0015](0015-aws-architecture-and-terraform-conventions.md) | Host the site on S3 and CloudFront in eu-north-1, with two Terraform stacks | Proposed |
