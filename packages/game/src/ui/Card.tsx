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
  /** Guess mode: the button is named "Guess Tiger". */
  guessing?: boolean;
  onPress: (character: Character) => void;
}

/** A card never moves or changes size; only its look and its words change. */
export function Card({
  character,
  ruledOut = false,
  picked,
  guessing = false,
  onPress,
}: CardProps): ReactElement {
  const { name } = character;
  const note = picked ? 'your pick' : ruledOut ? 'ruled out' : null;
  // On the pick screen aria-pressed carries "your pick", so the label is just the name.
  const label = guessing
    ? `Guess ${name}`
    : [name, picked === undefined ? note : null].filter(Boolean).join(', ');
  const classes = ['tt-card'];
  if (ruledOut) classes.push('tt-card--out');
  if (picked) classes.push('tt-card--picked');
  return (
    <button
      type="button"
      className={classes.join(' ')}
      aria-label={label}
      aria-pressed={picked}
      onClick={() => onPress(character)}
    >
      <Sprite character={character} size={64} decorative />
      {/* The visible name stays the same in guess mode, so the card never changes size. */}
      <span className="tt-card__name">{name}</span>
      {note && (
        <span className="tt-card__note">
          {picked && '✓ '}
          {note}
        </span>
      )}
    </button>
  );
}
