/** The end screen: who won, both animals, the stats and what to do next. */
import type { ReactElement } from 'react';
import type { Character } from '../engine/board';
import { gameResult, type GameState } from '../engine/game';
import { DIFFICULTY_LABELS } from './labels';
import { GameLog } from './GameLog';
import { Sprite } from './Sprite';

/** Props for {@link EndScreen}. */
export interface EndScreenProps {
  game: GameState;
  log: readonly string[];
  /** The site's Home page; the package itself has no routing. */
  homeHref: string;
  onPlayAgain: () => void;
  onChangeDifficulty: () => void;
}

/** One animal in a panel: "Your animal" or "Computer's animal". */
function Reveal({
  title,
  character,
}: {
  title: string;
  character: Character | undefined;
}): ReactElement | null {
  if (!character) return null;
  return (
    <figure className="tt-reveal">
      <figcaption className="tt-small">{title}</figcaption>
      <Sprite character={character} size={128} />
      <p className="tt-reveal__name">{character.name}</p>
    </figure>
  );
}

/** Game.tsx moves focus to the result heading when the game ends (spec: Focus). */
export function EndScreen({
  game,
  log,
  homeHref,
  onPlayAgain,
  onChangeDifficulty,
}: EndScreenProps): ReactElement {
  const result = gameResult(game);
  const find = (id: string): Character | undefined =>
    game.pack.characters.find((c) => c.id === id);
  const yours = find(game.player.secret);
  const theirs = find(game.computer.secret);
  const playerWon = result?.winner === 'player';

  return (
    <section className="tt-column" aria-labelledby="tt-end-title">
      <p className="tt-small">Game over</p>
      <h1 id="tt-end-title" data-focus-start className="tt-title" tabIndex={-1}>
        {playerWon ? 'You won!' : 'The computer won'}
      </h1>
      <p>
        {playerWon
          ? `You guessed the computer's animal: the ${theirs?.name.toLowerCase()}.`
          : `It guessed your animal: the ${yours?.name.toLowerCase()}.`}
      </p>

      <div className="tt-reveals">
        <Reveal title="Your animal" character={yours} />
        <Reveal title="Computer's animal" character={theirs} />
      </div>

      {result && (
        <dl className="tt-stats">
          <div>
            <dt>Turns played</dt>
            <dd>{result.turns}</dd>
          </div>
          <div>
            <dt>Questions you asked</dt>
            <dd>{result.questionsAsked}</dd>
          </div>
          <div>
            <dt>Wrong guesses</dt>
            <dd>{result.wrongGuesses}</dd>
          </div>
          <div>
            <dt>Difficulty</dt>
            <dd>{DIFFICULTY_LABELS[result.difficulty].name}</dd>
          </div>
        </dl>
      )}

      <div className="tt-actions">
        <button
          type="button"
          className="tt-button tt-button--primary"
          onClick={onPlayAgain}
        >
          Play again
        </button>
        <button
          type="button"
          className="tt-button"
          onClick={onChangeDifficulty}
        >
          Change difficulty
        </button>
        <a className="tt-button" href={homeHref}>
          Back to Home
        </a>
      </div>

      <details className="tt-details">
        <summary>Show the game log</summary>
        <GameLog entries={log} />
      </details>
    </section>
  );
}
