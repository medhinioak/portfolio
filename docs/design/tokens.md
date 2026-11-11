# Design tokens

The visual foundations of medhinioak.dev: fonts, colours, spacing and the light and
dark themes. The tokens are implemented as CSS custom properties in
`apps/site/src/styles/global.css`. Use colours and fonts only through these variables.

## Feel

A tidy game menu, not a startup landing page.

- Pixel type is seasoning, not the meal: headings, navigation and small labels only.
  Everything you read at length is in a plain, highly legible face.
- Generous whitespace. One column of text, short lines, clear sections.
- Almost no motion. No decorative animation. With `prefers-reduced-motion: reduce`,
  transitions and animations are switched off.
- One exception: the small GIF on the 404 page. It keeps a short loop and shows a still
  image under reduced motion ([`wireframes.md`](wireframes.md#404)).

## Type

| Role                           | Font                  | Weights and styles loaded       | Preloaded |
| ------------------------------ | --------------------- | ------------------------------- | --------- |
| Headings, navigation, labels   | Pixelify Sans         | 400                             | 400       |
| Body text                      | Atkinson Hyperlegible | 400, 700, 400 italic            | 400       |
| Code                           | System monospace      | (none loaded)                   | n/a       |

- CSS variables: `--font-pixel`, `--font-body`, `--font-mono`.
- Monospace stack: `ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace`.
- Latin subset only, `font-display: swap`. One weight of each font is preloaded.
  Bold and italic body text load on demand, when a page uses them.
- Fallbacks end in a generic family (`sans-serif`). Astro then generates
  metric-adjusted fallback faces, so text shifts very little when the web font arrives.
- Scale: base `1.125rem` (18px), line height `1.6`, text measure about `68ch`.
  Variables: `--text-sm` 1rem (labels), `--text-base` 1.125rem (body, h4),
  `--text-lg` 1.4rem (h3), `--text-xl` 1.75rem (h2), `--text-2xl` 2.25rem (h1).
  Headings step up modestly (about 1.25× per level) and keep Pixelify at sizes where the
  pixel shapes stay readable. Long headings may use the body font instead.

### How the fonts are self-hosted

The fonts never load from Google or any CDN ([ADR-0004](../adr/0004-no-third-party-requests-and-no-analytics-at-launch.md)).

They come from the npm packages `@fontsource/pixelify-sans` and
`@fontsource/atkinson-hyperlegible` (both OFL-1.1, pinned in the lockfile), through
**Astro's built-in Fonts API** with the `local` provider. `apps/site/astro.config.mjs`
lists the exact Latin `.woff2` file for each weight and style from the packages' `files/`
folders:

- At build time Astro copies only those files, with hashed names, to `dist/_astro/fonts/`.
  Visitors only ever request fonts from medhinioak.dev.
- The build reads from `node_modules` and never contacts a CDN, so builds are
  reproducible and work offline. Dependabot updates the packages.
- The `<Font>` component prints the `@font-face` rules and the preload links. Astro
  also generates the metric-adjusted fallbacks, which we would otherwise maintain by hand.
- Sizes (Latin woff2): Pixelify Sans 400 about 8 KB; Atkinson Hyperlegible about 17 KB per
  weight or style. A page preloads about 25 KB of fonts.

Not chosen:

- **Astro's `npm` provider:** reads the same packages, but only their `index.css`. In
  astro 6.4.8 that meant weight 400 only and the Latin Extended and Cyrillic files as
  well, all of them preloaded, ignoring the `subsets` setting.
- **Astro's `fontsource` provider:** downloads the latest files from the Fontsource API on
  every uncached build. It's still self-hosted for visitors, but the build needs the
  network and versions aren't pinned.
- **Importing the Fontsource CSS directly:** works, but no automatic preload of exactly one
  file and no generated fallback metrics.

## Colour

| Role                               | Variable            | Light     | Dark      |
| ---------------------------------- | ------------------- | --------- | --------- |
| Background                         | `--color-bg`        | `#FBF8F3` | `#14131C` |
| Surface (cards, code, header)      | `--color-surface`   | `#F1ECE2` | `#1F1D2B` |
| Text                               | `--color-text`      | `#1B1A23` | `#F1EEE6` |
| Muted text                         | `--color-muted`     | `#5A5766` | `#A8A4B5` |
| Accent: links, focus rings         | `--color-accent`    | `#5B3FD1` | `#A99BFF` |
| Label on accent                    | `--color-on-accent` | `#FFFFFF` | `#14131C` |
| Highlight (sparingly)              | `--color-highlight` | `#B93A00` | `#5EEAD4` |

- Highlight is for small marks: a cursor, a bullet, one word. Never the only way to
  show meaning, and never for large areas.
- Links are accent-coloured and underlined in body text, so they don't rely on colour alone.

### Overlay

| Role                                   | Variable        | Light                   | Dark                 |
| -------------------------------------- | --------------- | ----------------------- | -------------------- |
| Scrim: dims the page behind the drawer | `--color-scrim` | `rgba(27, 26, 35, 0.5)` | `rgba(0, 0, 0, 0.6)` |

Used only behind the phone menu drawer ([ADR-0007](../adr/0007-phone-navigation-drawer.md)).
It is a plain overlay: the drawer's text sits on `--color-bg`, never on the scrim, so it
has no contrast row. In `global.css` it is written once as `light-dark()` like the other
colours.

### Contrast

Computed with the WCAG 2.x relative-luminance formula. Text needs 4.5:1 (AA, normal
text); the focus ring is a non-text indicator and needs 3:1. All pairs pass.

| Pair                                 | Light         | Dark          | Needed |
| ------------------------------------ | ------------- | ------------- | ------ |
| Text on background / surface         | 16.27 / 14.64 | 15.89 / 14.27 | 4.5    |
| Muted text on background / surface   | 6.63 / 5.97   | 7.58 / 6.81   | 4.5    |
| Accent (links) on background / surface | 6.44 / 5.80 | 7.74 / 6.95   | 4.5    |
| Highlight on background / surface    | 5.40 / 4.86   | 12.46 / 11.19 | 4.5    |
| Label on accent                      | 6.83          | 7.74          | 4.5    |
| Focus ring (accent) vs background    | 6.44          | 7.74          | 3      |
| Divider lines (surface on background) | 1.11         | 1.11          | none   |

Divider lines (header and footer borders) are decorative: they carry no information,
so WCAG sets no minimum. They are meant to be quiet.

Any new colour pair gets a row here before it is used.

## Spacing, shape and focus

- Spacing on a 4px base: `--space-1` 4px, `--space-2` 8px, `--space-3` 12px,
  `--space-4` 16px, `--space-5` 24px, `--space-6` 32px, `--space-7` 48px.
- `--radius`: 4px. Small and square, in keeping with the pixel feel.
- `--column`: 46rem (736px), the width of the page column from the wireframes. Header,
  main and footer align with it, with a `--space-4` gutter on each side. (`68ch` in the
  body font is about 790px, so the column, not `--measure`, limits lines on desktop.)
- Control heights: `--control-height` 48px (buttons), `--control-height-small` 44px
  (small buttons, the menu, Close and theme buttons). Both are above the 24 × 24 px
  minimum target size of WCAG 2.2.
- Focus: `outline: 2px solid var(--color-accent); outline-offset: 2px` on
  `:focus-visible`, for every interactive element, in both themes. Never removed without
  a replacement.

## Breakpoint

The header switches from one row (wordmark, nav, theme toggle) to the phone layout
(menu button, wordmark, theme toggle) below **48em** (768 px at the default text size).
Media queries cannot read CSS variables, so the value is written in the media queries in
`apps/site/src/layouts/BaseLayout.astro` and the drawer script there; change all of them
together. It is in `em`, not `px`, so zooming in also switches to the phone layout: at
200 % zoom a 1280 px window is 640 CSS px wide and shows the menu button.

**Without JavaScript.** The inline theme script also adds a `js` class to `<html>`. Without
it, the menu button and the theme toggle stay hidden and on phone widths the nav shows as
a plain wrapped list under the wordmark. The page then follows the system theme.

## Theme

- **Modes:** system (default), light, dark.
- **No flash:** a tiny inline script at the top of `<head>` runs before first paint. It reads
  `localStorage["theme"]` inside `try/catch` and sets `data-theme` on `<html>` to
  `light`, `dark` or `system`.
- **CSS:** each colour variable is written once as `light-dark(light, dark)`. `:root` has
  `color-scheme: light dark`, so the system setting picks the value;
  `[data-theme="light"]` and `[data-theme="dark"]` force `color-scheme` to one of them.
  Form controls and scrollbars follow too. Without JavaScript the page simply follows
  the system setting.
- **Toggle:** one button that cycles system → light → dark. It's a React island
  ([ADR-0001](../adr/0001-astro-with-react-islands.md)), a real `<button>`, keyboard
  operable, with the accent focus ring. Its accessible name states the current mode, for
  example "Theme: system (dark). Change theme", and its visible label matches. After a
  click, a polite live region announces the new mode ("Theme set to dark"), because screen
  readers don't always re-read a focused button whose name changed. Other open tabs follow
  the change through the `storage` event.
- **Storage:** nothing is stored until the visitor clicks the toggle. Light or dark is then
  saved as `localStorage["theme"]`; choosing system removes the key. Every storage access is
  wrapped in `try/catch`, so a blocked storage (private mode, strict settings) only means
  the choice isn't remembered.
- **Privacy:** the privacy policy must mention this stored preference: what is stored,
  that it stays in the browser, is never sent anywhere, and how to clear it
  ([ADR-0004](../adr/0004-no-third-party-requests-and-no-analytics-at-launch.md),
  launch checklist).

## Not covered yet

Components beyond the shared styles in `global.css` (`.button`, `.button-small`, `.chip`,
`.card`, `.title-long`; see [`wireframes.md`](wireframes.md#the-shared-frame)): post lists,
game UI and illustrations.
Page layouts are in [`wireframes.md`](wireframes.md).

## Screenshots

The Phase 0 home page with these tokens, taken with headless Chrome:
[light](screenshots/light.png), [dark](screenshots/dark.png),
[390 px light](screenshots/phone-390.png), [390 px dark](screenshots/phone-390-dark.png).
