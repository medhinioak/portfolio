/** The start screen: how to play and the difficulty choice. */
import type { ReactElement } from 'react';
import type { BoardPack } from '../engine/board';
import type { Difficulty } from '../engine/game';
import { DIFFICULTIES, DIFFICULTY_LABELS } from './labels';
import { Sprite } from './Sprite';

/** Props for {@link StartScreen}. */
export interface StartScreenProps {
  pack: BoardPack;
  difficulty: Difficulty;
  onChoose: (difficulty: Difficulty) => void;
  onNext: () => void;
}

/** Title, pitch, three steps, the difficulty radio group and "Next". */
export function StartScreen({
  pack,
  difficulty,
  onChoose,
  onNext,
}: StartScreenProps): ReactElement {
  return (
    <section className="tt-column" aria-labelledby="tt-title">
      <h1 id="tt-title" className="tt-title" tabIndex={-1} data-focus-start>
        Tail Trail
      </h1>
      <p className="tt-lead">
        Ask yes/no questions and find the computer&apos;s secret animal before
        it finds yours.
      </p>
      <div className="tt-strip" aria-hidden="true">
        {pack.characters.slice(0, 8).map((c) => (
          <Sprite key={c.id} character={c} size={64} decorative />
        ))}
      </div>

      <h2 className="tt-heading">How to play</h2>
      <ol className="tt-steps">
        <li>
          Each of you has a secret animal. You choose yours. You never see the
          computer&apos;s.
        </li>
        <li>
          Take turns. Ask a yes/no question about the computer&apos;s animal, or
          guess it. A wrong guess loses your turn.
        </li>
        <li>The first to guess the other&apos;s animal wins.</li>
      </ol>

      <fieldset className="tt-difficulty">
        <legend className="tt-heading">Difficulty</legend>
        {DIFFICULTIES.map((id) => (
          <label key={id} className="tt-option">
            <input
              type="radio"
              name="tt-difficulty"
              value={id}
              checked={difficulty === id}
              onChange={() => onChoose(id)}
            />
            <span>
              <span className="tt-option__name">
                {DIFFICULTY_LABELS[id].name}
              </span>
              <span className="tt-option__description">
                {DIFFICULTY_LABELS[id].description}
              </span>
            </span>
          </label>
        ))}
      </fieldset>

      <p>
        You take the first turn. A banner above the board always says whose turn
        it is.
      </p>
      <button
        type="button"
        className="tt-button tt-button--primary"
        onClick={onNext}
      >
        Next: pick your animal
      </button>
      <p className="tt-small">
        The game runs in your browser. Nothing is saved or sent anywhere.
      </p>
    </section>
  );
}
