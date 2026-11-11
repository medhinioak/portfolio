# ADR-0007: Use a left drawer for phone navigation

- Status: Proposed
- Date: 2026-11-11
- Decider: Medhini
- Review: Claude (project chat), 2026-11-11

## Context

The header has five links and a theme toggle. On a phone, the first wireframe put the
links in a second row under the wordmark, which took a large part of the screen above
the content. I want the menu behind a button that opens a sidebar. Content pages are
meant to ship close to zero JavaScript ([ADR-0001](0001-astro-with-react-islands.md)),
and a drawer is interactive, so it has a cost and accessibility duties
([WCAG 2.2 AA](../plan.md#constraints)).

## Decision

On phone widths the nav sits behind a menu button and opens as a drawer from the left
over a dimmed page. Layouts: [`wireframes.md`](../design/wireframes.md#phone-menu).

- The button has `aria-expanded` and `aria-controls`.
- Opening moves focus to the Close button in the drawer. Escape, the Close button and
  a tap on the dimmed area close it, and focus returns to the menu button. Following a
  nav link also closes it, including same-page links such as `/#contact` on Home.
- While the drawer is open, Tab stays inside it and the page behind is inert, so
  keyboard and screen-reader users cannot reach content hidden under the scrim.
- The current page is marked `aria-current="page"`, as set out in
  [`wireframes.md`](../design/wireframes.md#the-shared-frame).
- The dimming colour is a new token, `--color-scrim`, added to `tokens.md` first. It is
  a plain overlay and needs no contrast row.

The width at which the single-row desktop header becomes the menu button is set in the
build, not here.

## Alternatives considered

- **Keep the two-row header.** No JavaScript, but it costs vertical space on every page.
- **A bottom tab bar.** Reachable with a thumb, but it is a different look from the
  game-menu feel and competes with the footer.
- **A native `<dialog>` or `popover` element.** May give the same drawer with little or
  no custom JavaScript. Worth trying first when building; this ADR keeps the behaviour
  above, not the mechanism.

## Consequences

- One small interactive piece on every page, so it must stay light and keep the
  Lighthouse budget in the launch checklist.
- The drawer needs a keyboard and screen-reader pass (launch checklist, accessibility).
- Without JavaScript the nav must still be usable; the build decides how (for example a
  plain list under the header).
- Revisit if the drawer costs more than it gives, or if the nav grows beyond five items.
