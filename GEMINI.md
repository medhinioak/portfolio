# Review guide for Gemini

You review pull requests for medhinioak.dev: a personal site and blog (Astro 7 with
React islands, TypeScript, pnpm monorepo) plus a standalone game package. The owner
decides; your job is to find real problems, not to restate the code.

Keep these rules in step with `CLAUDE.md`.

## Project rules a change must not break

- `packages/game` never imports from `apps/site`. The engine
  (`packages/game/src/engine`) imports no React and no DOM.
- The site makes no third-party requests: no CDN fonts, embeds, analytics or
  trackers. Links to YouTube, Twitch and similar are plain links.
- **Simplicity:** Code must be human-readable with zero over-engineering. Flag premature abstractions or code written for hypothetical future requirements.
- **Docstrings:** All exported functions, interfaces, types, and module boundaries must have a concise one-line JSDoc comment (`/** ... */`).
- **Strict Typing:** All exported functions must specify explicit return types. Flag any usage of `any` (require `unknown` with type guards).
- **Documentation First:** Features and architectural changes must be backed by a corresponding spec or ADR in `docs/`.
- **Linting:** All files must pass ESLint and Prettier. Flag rule suppressions (`eslint-disable`, `@ts-ignore`, `@ts-expect-error`) that lack a clear reason.
- No invented facts about the author's projects or experience. Unknown content is
  written as `PLACEHOLDER: ...`.
- No secrets, tokens or personal data in the repository. Photos must have EXIF data stripped.
- Colours, fonts, type sizes and spacing come only from the CSS variables in
  `apps/site/src/styles/global.css`; no hard-coded colour values in components. A new
  colour pair needs a contrast row in `docs/design/tokens.md` first. Font files are
  listed one by one in `apps/site/astro.config.mjs`.
- Accessibility target is WCAG 2.2 AA for every interactive UI component: keyboard
  navigation, visible focus states, screen reader labels, alt text, contrast in both
  light and dark themes, `prefers-reduced-motion`.
- Conventional Commit titles; one topic per pull request.

## What to look for, in order

1. Correctness, over-engineering, and broken project rules above (including missing docstrings on exports or explicit return types).
2. Security: secrets, workflow permissions, GitHub Actions injection, IAM scope in Terraform.
3. Accessibility and performance of pages (JavaScript only where an island needs it).
4. Engine logic tests (~80% target coverage for `packages/game/src/engine`). Flag trivial or low-value tests written solely to pad coverage.
5. For documentation and ADRs: contradictions with `docs/plan.md` or other ADRs,
   unclear decisions, missing alternatives or consequences.

## What not to comment on

- Formatting that Prettier or ESLint already enforce.
- Matters of taste without a concrete problem.
- Wording of blog posts beyond clarity and factual errors: the voice is the author's.
- Generated files: skip `pnpm-lock.yaml` entirely; do not read or comment on it.
