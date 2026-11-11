# ADR-0008: Upgrade the site to Astro 7

- Status: Proposed
- Date: 2026-11-11
- Decider: Medhini
- Review: pending (the PR for issue #24)

## Context

ADR-0001 chose Astro 6. Dependabot reports open security alerts for it on `main`,
including a critical remote code execution in Astro's AVIF image optimization
(GHSA-26w7-cxv4-gfx2), several XSS issues and an auth bypass. All the Astro fixes are
only in 7.x: there is no 6.x patch. `sharp` has three high alerts, fixed in 0.35.5;
Astro 6.4.8 expects `sharp` `^0.34.0`, and Astro 7.4 expects `^0.35.4`.

None of this is exploitable today: the site has no images and no untrusted content.
That changes once case studies and blog posts add images (#30, #32), and the alerts
must be closed before launch (#35).

Astro 7 uses Vite 8, and `@astrojs/react` 7 needs Astro 7 and `@vitejs/plugin-react` 6.
Astro 7.4 needs Node 22.23.4 or newer.

## Decision

Upgrade the site to Astro 7 with `@astrojs/react` 7 and `sharp` 0.35.5, and move the
game package to Vite 8 and `@vitejs/plugin-react` 6 in the same change, so the
repository keeps one Vite. This supersedes only ADR-0001's version choice; the rest of
ADR-0001 still stands.

## Alternatives considered

- **Stay on Astro 6 and accept the alerts until launch.** Nothing is exploitable yet,
  but the upgrade only gets bigger as pages and images are added, and #30 and #32 would
  add images on a version with a known critical image bug.
- **Upgrade Astro alone and keep Vite 7 in the game.** Two Vite majors in one
  repository, two sets of config rules and a duplicate toolchain in the lockfile.

## Consequences

- The Astro and `sharp` security alerts close.
- Node 22.23.4 or newer is required (root `engines.node`). `.nvmrc` stays `22`, which
  resolves to the newest 22.x.
- Astro 7 strips whitespace between elements by JSX rules (`compressHTML: 'jsx'`). Text
  that relies on a space between two inline elements needs an explicit `{' '}`.
- Astro 7 renders Markdown with Sätteri by default. The site keeps the unified
  processor (`@astrojs/markdown-remark`) because of the `rehype-figure` plugin.
- Revisit when Astro 8 is released, or if a 7.x minor raises the Node minimum again.
