/** The player's board: every card, with the player's ruled-out marks. */
import type { ReactElement } from 'react';
import type { BoardPack, Character } from '../engine/board';
import { countStillIn, isRuledOut, type ManualMarks } from '../engine/marks';
import { Card } from './Card';

/** Props for {@link Board}. */
export interface BoardProps {
  pack: BoardPack;
  /** What the answers leave for the computer's animal. */
  candidates: readonly string[];
  marks: ManualMarks;
  guessing: boolean;
  onPress: (character: Character) => void;
  onResetMarks: () => void;
}

/** "Your board": the count, "Reset marks" and the grid of cards. */
export function Board({
  pack,
  candidates,
  marks,
  guessing,
  onPress,
  onResetMarks,
}: BoardProps): ReactElement {
  const ids = pack.characters.map((c) => c.id);
  const left = countStillIn(ids, candidates, marks);
  return (
    <section className="tt-board" aria-labelledby="tt-board-title">
      <div className="tt-board__head">
        <div>
          <h2 id="tt-board-title" className="tt-heading">
            Your board
          </h2>
          <p className="tt-muted">
            Which animal is the computer&apos;s? {left} of {ids.length} still
            in.
          </p>
        </div>
        <button type="button" className="tt-button" onClick={onResetMarks}>
          Reset marks
        </button>
      </div>
      <div className="tt-grid">
        {pack.characters.map((c) => (
          <Card
            key={c.id}
            character={c}
            ruledOut={isRuledOut(c.id, candidates, marks)}
            guessing={guessing}
            onPress={onPress}
          />
        ))}
      </div>
    </section>
  );
}
