/// <reference types="vite/client" />
/** A character's pixel-art sprite, drawn inline so its outline follows `--game-text`. */
import type { ReactElement } from 'react';
import type { Character } from '../engine/board';

/** Sprites are drawn on a 32 × 32 grid and shown at whole multiples of it. */
export type SpriteSize = 32 | 64 | 128;

/** Props for {@link Sprite}. */
export interface SpriteProps {
  character: Character;
  size: SpriteSize;
  /** Hide it from screen readers when the name is already next to it. */
  decorative?: boolean;
}

// The sprite files are bundled as text: about 11 KB gzipped for all 24 (docs/game/spec.md, Art plan).
const files = import.meta.glob<string>('../boards/animals/sprites/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
});

/** The inside of a sprite file (its paths), or undefined if the pack names no such file. */
function spriteInner(name: string): string | undefined {
  const svg = files[`../boards/animals/sprites/${name}.svg`];
  return svg?.slice(svg.indexOf('>') + 1, svg.lastIndexOf('</svg>'));
}

/** Draws one sprite in `currentColor`, or a crossed box when its file is missing. */
export function Sprite({
  character,
  size,
  decorative = false,
}: SpriteProps): ReactElement {
  const label = decorative
    ? { 'aria-hidden': true }
    : { role: 'img', 'aria-label': character.alt };
  const props = {
    className: 'tt-sprite',
    width: size,
    height: size,
    viewBox: '0 0 32 32',
    shapeRendering: 'crispEdges',
    ...label,
  };
  const inner = spriteInner(character.sprite);
  if (inner) {
    // Our own files from the repository, checked by boards/sprites.test.ts.
    return <svg {...props} dangerouslySetInnerHTML={{ __html: inner }} />;
  }
  return (
    <svg {...props}>
      <rect
        x="0.5"
        y="0.5"
        width="31"
        height="31"
        fill="none"
        stroke="currentColor"
      />
      <path d="M1 1 31 31M31 1 1 31" stroke="currentColor" strokeWidth="0.5" />
    </svg>
  );
}
