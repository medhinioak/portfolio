# ADR-0010: Show code blocks without syntax highlighting at launch

- Status: Proposed
- Date: 2026-11-12
- Decider: Medhini
- Review: PLACEHOLDER: who reviewed the decision, date

## Context

Blog posts can contain code blocks (#32). Astro highlights them with Shiki by default,
and Shiki writes each colour inline in the HTML. The site's rule is that colours come
only from the CSS variables in `global.css`, and every colour pair needs a contrast
row in `docs/design/tokens.md` (4.5:1 for text, in both themes).

## Decision

Turn syntax highlighting off (`markdown.syntaxHighlight: false`). Code blocks use the
text colour on the surface colour, a pair already in the contrast table, in the system
monospace stack, and scroll sideways.

## Alternatives considered

- **Shiki's `css-variables` theme** — keeps highlighting with our own variables, but
  needs about eight new token colours, each with a contrast row for both themes, before
  the first post has any code. Too much for the launch scope.
- **Prism with a stylesheet** — the same token work, plus a second highlighter to keep.

## Consequences

Code blocks are plain and cost no extra CSS or inline styles. Long code samples are
harder to scan. Revisit if posts start to carry a lot of code; the `css-variables`
theme is then the way in, with its contrast rows added first.
