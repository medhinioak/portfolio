# ADR-0014: Keep sprites as 32 × 32 PNG masters and export them to SVG

- Status: Proposed
- Date: 2026-11-17
- Decider: Medhini
- Review: Claude (project chat), 2026-11-17

## Context

[ADR-0012](0012-game-art-is-ai-assisted-pixel-art-edited-by-the-owner.md) says each
animal is drafted with an AI image tool and then edited by the owner on the 32 × 32 grid.
The drafts are large images that only look like pixel art: the pixels are finer than the
grid, there are thousands of colours, and the backgrounds are white.
[Issue #74](https://github.com/medhinioak/portfolio/issues/74) asks for one SVG per animal,
at most about 2 KB, with no metadata, and the spec asks for one shared palette of at most
16 colours and a 1 px outline in `--game-text`
([`game/spec.md`](../game/spec.md#art-plan)). A vector editor is a poor fit for editing
single pixels, and it adds metadata to its files.

## Decision

The editable master of each sprite is a 32 × 32 PNG that uses only the shared palette. A
small script in `packages/game/tools/sprites/` does the mechanical steps, and the owner does
the editing in any pixel editor:

1. **Split** a sheet of AI drafts into one image per animal.
2. **Draft**: remove the background, scale the animal to fit the 32 × 32 grid with its
   feet on the bottom row, map every pixel to the shared palette and mark the outline.
3. The owner **edits** the draft PNG.
4. **Export** the PNG to an SVG made of merged rectangles.

Conventions:

- **One shared palette** in `packages/game/src/boards/animals/palette.json`: the outline
  plus up to 15 colours, picked from the drafts by median cut. The palette is
  fixed once accepted, so every sprite is checked against the same colours.
- **The outline is the silhouette's edge pixels.** It uses one reserved colour in the PNG
  and `currentColor` in the SVG, so the sprite is outlined in `--game-text` in both
  themes when the card sets `color: var(--game-text)`. The outline, not the fills, carries
  the contrast, so a black panda or a white penguin reads on either background.
- **Every sprite is drawn to fill the grid**, standing on the bottom row, facing left or
  right. Poses and outline weight follow from the grid, not from the drafts.
- **Only the SVG files are shipped.** The PNG masters and the original AI images stay out
  of `apps/site` and out of the built site.

## Alternatives considered

- **Edit SVGs directly** — what #74 first assumed, but editors export paths and
  metadata, and fixing single pixels by hand in markup is slow.
- **Ship PNGs and scale them with CSS** — simple, but not themeable (no `currentColor`
  outline) and blurry unless every size is a whole multiple.
- **A per-sprite palette** — better looking, but the 16-colour limit exists so the 24
  animals look like one set.
- **Automatic conversion only** — fastest, but the result is not the owner's work
  ([ADR-0012](0012-game-art-is-ai-assisted-pixel-art-edited-by-the-owner.md)).

## Consequences

- The owner edits pixels in a tool she likes, and the build never depends on it.
- Fitting every animal to the grid makes a mouse as tall as an elephant. The board shows
  names beside the sprites, so this is accepted; revisit if it confuses players.
- Thin features (legs, tentacles, antennae) are lost at 32 px and are redrawn by hand.
- The palette is not committed yet. The first one the script generated has five almost
  identical dark colours and no pink, so the flamingo turns beige. It needs tuning by hand
  (the file is a list of hex colours) before this ADR is accepted.
- Exported drafts are 1.8 to 6.8 KB as plain text (at most 1.6 KB gzipped), against the
  "about 2 KB" in #74. Hand-cleaned sprites have fewer rectangles and will be smaller; the
  script warns above 2 KB and does not fail.
- A shared 16-colour palette limits shading. Revisit if the set looks flat after editing,
  or if a palette change is needed: sprites are then exported again from their masters.
