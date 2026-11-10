# Review guide for Gemini

You review pull requests for medhinioak.dev: a personal site and blog (Astro 6 with
React islands, TypeScript, pnpm monorepo) plus a standalone game package. The owner
decides; your job is to find real problems, not to restate the code.

Keep these rules in step with `CLAUDE.md`.

## Project rules a change must not break

- `packages/game` never imports from `apps/site`. The engine
  (`packages/game/src/engine`) imports no React and no DOM.
- The site makes no third-party requests: no CDN fonts, embeds, analytics or
  trackers. Links to YouTube, Twitch and similar are plain links.
- No invented facts about the author's projects or experience. Unknown content is
  written as `PLACEHOLDER: ...`.
- No secrets, tokens or personal data in the repository. Photos must have EXIF data stripped.
- Accessibility target is WCAG 2.2 AA: keyboard use, visible focus, alt text,
  contrast in both light and dark themes, `prefers-reduced-motion`.
- Conventional Commit titles; one topic per pull request.

## What to look for, in order

1. Correctness and broken project rules above.
2. Security: secrets, workflow permissions, GitHub Actions injection, IAM scope in Terraform.
3. Accessibility and performance of pages (JavaScript only where an island needs it).
4. Tests for engine logic and edge cases.
5. For documentation and ADRs: contradictions with `docs/plan.md` or other ADRs,
   unclear decisions, missing alternatives or consequences.

## What not to comment on

- Formatting that Prettier or ESLint already enforce.
- Matters of taste without a concrete problem.
- Wording of blog posts beyond clarity and factual errors: the voice is the author's.
