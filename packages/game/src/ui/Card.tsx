/** One animal card on a board: a button with the sprite and the name. */
import type { ReactElement } from 'react';
import type { Character } from '../engine/board';
import { Sprite } from './Sprite';

/** Props for {@link Card}. */
export interface CardProps {
  character: Character;
  /** Blurred sprite, dashed border and the words "ruled out". */
  ruledOut?: boolean;
  /** Pick screen only: thick border, a tick and "your pick"; leave out elsewhere. */
  picked?: boolean;
  /** Guess mode: the button's name starts with "Guess". */
  guessing?: boolean;
  onPress: (character: Character) => void;
  /** Set by the grid: only one card is a tab stop. */
  tabIndex?: number;
}

/** A card never moves or changes size; only its look and its words change. */
export function Card({
  character,
  ruledOut = false,
  picked,
  guessing = false,
  onPress,
  tabIndex,
}: CardProps): ReactElement {
  const { name } = character;
  const note = picked ? 'your pick' : ruledOut ? 'ruled out' : null;
  const classes = ['tt-card'];
  if (ruledOut) classes.push('tt-card--out');
  if (picked) classes.push('tt-card--picked');
  return (
    <button
      type="button"
      className={classes.join(' ')}
      aria-pressed={picked}
      tabIndex={tabIndex}
      onClick={() => onPress(character)}
    >
      <Sprite character={character} size={64} decorative />
      {/*
        The name comes from the visible text, so it always contains what is on screen
        (WCAG 2.5.3): "Guess Tiger, ruled out". Only "Guess" and the comma are hidden.
      */}
      <span className="tt-card__name">
        {guessing && <span className="tt-sr-only">Guess </span>}
        {name}
      </span>
      {/* On the pick screen aria-pressed already says "your pick", so the note is hidden. */}
      {note && (
        <span
          className="tt-card__note"
          aria-hidden={picked === undefined ? undefined : true}
        >
          <span className="tt-sr-only">, </span>
          {picked && <span aria-hidden="true">✓ </span>}
          {note}
        </span>
      )}
    </button>
  );
}
