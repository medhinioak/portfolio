/** A character's sprite. Until the art lands (#74) it is the wireframes' crossed box. */
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

/** Draws one sprite in `currentColor`, so it follows `--game-text` in both themes. */
export function Sprite({
  character,
  size,
  decorative = false,
}: SpriteProps): ReactElement {
  const label = decorative
    ? { 'aria-hidden': true }
    : { role: 'img', 'aria-label': character.alt };
  return (
    <svg
      className="tt-sprite"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      shapeRendering="crispEdges"
      {...label}
    >
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
