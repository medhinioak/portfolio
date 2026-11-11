# Wireframes

Status: draft for review · Owner: Medhini · Issue: #5 · Last updated: 2026-11-11

Low-fidelity layouts for the five page types that need a design before the build:
Home, About, a case study, a blog post and the 404 page. Colours, fonts and spacing
come from [`tokens.md`](tokens.md); nothing here introduces a new style except where
[Open items](#open-items) says so.

## How these were made

Drawn in Claude Design with the real tokens, in light and dark, at 1280 px (desktop)
and 390 px (phone). The PNGs in [`wireframes/`](wireframes/) are the record. The
editable source is a private Claude Design file, so a change to a layout is made by
editing this page and the PNG together in a PR.

How to read them:

- Every piece of text is `PLACEHOLDER:` or a generic label. No real content is
  written yet (see `CLAUDE.md`: never invent facts).
- A box with a cross is an image. "Optional" means the layout works without it.
- A dashed box is reserved space that does not ship at launch.

## The shared frame

Every page uses the same frame.

**Column.** One column of text at the `68ch` measure from `tokens.md` (about 736 px
on desktop), centred. On a phone the column
is the screen width minus a 16 px gutter on each side.

**Header, desktop.** One row: the wordmark "Medhini Oak" (pixel type, `--text-lg`) on the
left, then the nav (Home, About, Projects, Blog, Contact), then the theme toggle on
the right. "Contact" is not a page: it links to the Contact section on Home (`/#contact`)
from every page. The current page is underlined in the accent colour and marked
`aria-current="page"`: Home on `/`, Projects on `/projects` and every case study, Blog
on `/blog` and every post, About on `/about`. Contact is never marked, and no item is
marked on other pages. The toggle reads "Theme: System", "Theme: Light" or
"Theme: Dark" and announces its state.

**Header, phone.** A menu button, the wordmark and the theme toggle. The menu button
opens a left drawer (see [Phone menu](#phone-menu)).

**Footer.** Impressum, Privacy, the contact email and RSS, then the copyright line.
It appears on every page, including the 404, so Impressum and Privacy stay one click
away from everywhere.

**Buttons.** Links that act like buttons have a 2 px border and a 4 px radius.
Primary: accent fill, on-accent text, 48 px high. Secondary: surface fill, 2 px text
border. Small buttons ("All projects", "All posts", "RSS", "Previous project") are
44 px high and carry an arrow or a feed icon. Pixel type for button labels.

**Titles.** Page titles of the Home, About and 404 pages use pixel type. Case-study
and blog-post titles, and the titles on project and post cards, use Atkinson
Hyperlegible bold, because real titles are long (`tokens.md` allows the body font for
long headings).

**Chips.** Small bordered labels for tags and skills, pixel type, `--text-sm` (the wireframes draw them at 14 px; the build uses
the token).

**Images.** Always optional per page, per case study and per card. They have a fixed
shape so the layout does not jump when they load, and an alt text, or an empty alt if
they are decoration. Photos have their EXIF data stripped before they are committed.

**Keyboard.** The first Tab stop on every page is a skip link that appears at the top
left on focus. Focus rings use the accent colour in both themes.

### Phone menu

Closed, the menu is a button; the nav is not visible. Open, a drawer slides in from
the left over a dimmed page.

- The drawer holds the five nav items, with the current page marked, and a Close
  button.
- Opening moves focus to the Close button. Escape, the Close button and a tap on the
  dimmed area all close it, and focus returns to the menu button.
- Following a nav link also closes it, including same-page links such as Contact
  (`/#contact`) on Home; focus then goes to the link's target, not the menu button.
- While it is open, Tab stays inside the drawer and the page behind is inert.
- The menu button has `aria-expanded` and `aria-controls`.
- Without JavaScript the nav must still be usable; the build decides how
  ([ADR-0007](../adr/0007-phone-navigation-drawer.md#consequences)).
- The dimmed area uses the `--color-scrim` token from [`tokens.md`](tokens.md#overlay).
- Both open states are drawn: [light](wireframes/home-light-phone-menu.png) and
  [dark](wireframes/home-dark-phone-menu.png).

## Home (`/`)

Purpose: a friendly landing page. Who I am, a way to my CV, my work, my latest post,
and how to reach me.

Order, top to bottom:

1. **Intro.** One-line headline, a short role line with a small highlight bar, 2-3
   sentences, and one primary button: "Read my CV". There is no second hero button
   and no CV link in the header.
2. **Projects.** Heading and an "All projects" button. Two stacked cards. A card has
   an optional image on the left (above the text on a phone), a bold title link, a
   one-line summary, tag chips, and a role-and-year line. The first card shows the
   image; the second shows the text-only layout.
3. **Blog.** Heading with "All posts" and "RSS" buttons. One card with the date, a
   bold title link and a one-line summary.
4. **Game teaser.** A dashed box, reserved for Phase 3 (`/play`). Not shown at launch.
5. **Contact.** One line, then "Email me" (primary, a `mailto:` link with a prefilled
   subject), GitHub and LinkedIn. Under them the address as plain text, for people
   without a mail app. Then a "Videos and streams" sub-heading with YouTube and Twitch.

Screenshots: [light desktop](wireframes/home-light-desktop.png),
[dark desktop](wireframes/home-dark-desktop.png),
[light phone](wireframes/home-light-phone.png),
[dark phone](wireframes/home-dark-phone.png).

## About (`/about`)

Purpose: a page about a person, not a CV. The work side is one small block.

Order, top to bottom:

1. **About.** Heading, an optional portrait (square) beside the text on desktop and
   above it on a phone, and a short intro.
2. **Things I love.** A grid of cards, two columns on desktop and one on a phone: Puzzle
   games, Cats, Anime, K-pop, 90s aesthetic, Cooking (plant-based), Culture. Each
   card has a pixel-type label and one or two lines. A card may have an optional photo
   (Cats shows one). The last card spans both columns on desktop. The topics are
   placeholders: in the build each label is `PLACEHOLDER:` until the owner confirms it.
3. **How I use AI.** A short paragraph on principles, and a button to a plain link to
   how the site was built with AI: `docs/ai-usage.md` on GitHub
   (`https://github.com/medhinioak/portfolio/blob/main/docs/ai-usage.md`), since the
   docs are not part of the built site.
4. **What I do.** A short paragraph and three buttons: "Read my CV" (primary),
   "See projects" and "Get in touch".

Screenshots: [light desktop](wireframes/about-light-desktop.png),
[dark desktop](wireframes/about-dark-desktop.png),
[light phone](wireframes/about-light-phone.png),
[dark phone](wireframes/about-dark-phone.png).

## Case study (`/projects/[slug]`)

Purpose: one template for every case study.

Order, top to bottom:

1. **Header.** An "All projects" button, the title (Atkinson bold), a one-or-two
   sentence summary, a details box (role, timeframe, team, context, stack as chips),
   and two buttons: "View code" (primary) and "Live demo".
2. **Hero image.** Optional, with an optional caption.
3. **The problem**, **What I did**, **Outcome**, **What I learned.** A short section
   each. "What I did" can hold an optional figure or diagram with a caption.
4. **Credits.** Teammates, the university or employer, and permission to publish. The
   launch checklist requires permission for each case study.
5. **Previous / next project** buttons. Shown only when there is more than one case
   study.

"Live demo", the hero image and the figure are left out when there is nothing to show.

Screenshots: [light desktop](wireframes/case-study-light-desktop.png),
[dark desktop](wireframes/case-study-dark-desktop.png),
[light phone](wireframes/case-study-light-phone.png),
[dark phone](wireframes/case-study-dark-phone.png).

## Blog post (`/blog/[slug]`)

Purpose: a readable post with the elements a post may use.

Order, top to bottom:

1. **Header.** An "All posts" button, date and reading time, the title (Atkinson bold),
   a one-or-two sentence summary and tag chips.
2. **Cover image.** Optional. Only the top image loads eagerly.
3. **Body.** Shows every element a post can use: paragraphs, a section heading, a link,
   a quote, a list, a sub-heading, a code block and an inline image with a caption.
   Line length is about 68 characters (`tokens.md`). Code uses the system monospace
   stack and scrolls sideways instead of wrapping.
4. **End of post.** "Previous post" and "Next post" buttons, then "Subscribe with RSS".

There are no share buttons and no comments, since both would make third-party requests
([ADR-0004](../adr/0004-no-third-party-requests-and-no-analytics-at-launch.md)).

Screenshots: [light desktop](wireframes/blog-post-light-desktop.png),
[dark desktop](wireframes/blog-post-dark-desktop.png),
[light phone](wireframes/blog-post-light-phone.png),
[dark phone](wireframes/blog-post-dark-phone.png).

## 404

Purpose: a friendly dead end with a way out.

- **No site header.** The page is a single centred block between the top of the
  screen and the footer. With no toggle, it uses the theme the
  visitor saved elsewhere on the site, or the system theme if none is saved.
- **Content.** A small animated GIF, an "Error 404" label, the heading "Page not
  found", one friendly line, three buttons ("Go to Home", "Projects", "Blog") and a
  "Found a broken link? Get in touch" line.
- **The GIF.** Small and decorative (empty alt); the asset comes later. A GIF cannot
  follow `prefers-reduced-motion` by itself, so use a `<picture>` element with a still
  image for reduced motion, and keep the loop short. It is the one exception to "no
  decorative animation" in [`tokens.md`](tokens.md#feel).
- **Status.** The page must return HTTP status 404 (launch checklist).

Screenshots: [light desktop](wireframes/404-light-desktop.png),
[dark desktop](wireframes/404-dark-desktop.png),
[light phone](wireframes/404-light-phone.png),
[dark phone](wireframes/404-dark-phone.png).

## Decisions made while drawing

| Decision | Why |
|---|---|
| "Elsewhere" is now "Contact", with an email button and the channel links | The email address is the main way to reach me. The plan's launch scope line changes with it. |
| Contact is a section on Home, reached from the nav item; there is no `/contact` page | One less page to build and keep. The nav item and every "Get in touch" button link to `/#contact`, from any page. |
| The scrim colour is a plain overlay | The drawer's text sits on the normal background, so it needs no contrast row. |
| The email button is a `mailto:` link, with the address also shown as text | A mailto link sets only the recipient and subject; the visitor's mail app chooses the sender, and a form backend is a non-goal in the plan. |
| The CV link appears only in the hero (and in "What I do" on About) | The header link and the hero button did the same job. The plan only needs the CV one click from Home. |
| One hero button | "See my work" scrolled to the list directly below it. |
| A single-row desktop header | It fits once the CV link is gone. |
| The wordmark is "Medhini Oak" in pixel type, replacing `medhinioak.dev` | A design decision for the visual look. |
| The phone menu is a left drawer ([ADR-0007](../adr/0007-phone-navigation-drawer.md)) | It frees the top of the screen. It needs a small amount of JavaScript. |
| Images are optional everywhere | Backend and cloud projects often have a diagram, not a screenshot. |
| Long titles use Atkinson bold | Real case-study titles read badly in 22 px pixel type. |
| About is a personal page, with "What I do" as one block | The audience is friends first. Experience and skills live in the CV and the case studies. |
| The 404 has no header | A dead end should not offer a full nav; the footer keeps the legal links. |

An outside review of the Home layout was also considered. These suggestions were not
adopted: a hero terminal graphic (it breaks the single column), invented metrics (they
break the no-invented-facts rule), a two-column project grid (it leaves an empty half
while there are one or two case studies) and removing the footer email (the launch
checklist expects one that receives mail).

## Open items

- **Not drawn.** The Projects list (`/projects`), the Blog list (`/blog`), Impressum
  and Privacy. They reuse the frame and the card styles above.
- **Breakpoint.** The wireframes show 1280 px and 390 px only. The build switches to the
  menu button below 48em ([`tokens.md`](tokens.md#breakpoint)).

## Review

Layouts reviewed by Medhini on the Claude Design canvas. UI review of the built pages
follows the matrix in [`ai-usage.md`](../ai-usage.md#review-matrix).
