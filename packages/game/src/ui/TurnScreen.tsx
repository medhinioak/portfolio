/** The turn screen: banner, your animal, both boards, the questions and the log. */
import { useId, useRef, useState, type ReactElement } from 'react';
import { flushSync } from 'react-dom';
import type { Character } from '../engine/board';
import { answersFor, type GameState } from '../engine/game';
import { Board } from './Board';
import { ComputerBoard } from './ComputerBoard';
import { GameLog } from './GameLog';
import { GuessDialog } from './GuessDialog';
import { QuestionPicker } from './QuestionPicker';
import { Sprite } from './Sprite';
import { FIRST_TURN, type GameView } from './useGame';

/** Props for {@link TurnScreen}. */
export interface TurnScreenProps {
  view: GameView;
  game: GameState;
}

/** One screen for the whole game in play; every rule is the engine's, via `view`. */
export function TurnScreen({ view, game }: TurnScreenProps): ReactElement {
  const { pack } = game;
  const [pending, setPending] = useState<Character | null>(null);
  // Phones show one board at a time; desktop always shows both (spec: Layout).
  const [phoneBoard, setPhoneBoard] = useState<'yours' | 'computer'>('yours');
  const banner = useRef<HTMLDivElement>(null);
  const filterBox = useRef<HTMLInputElement>(null);
  const questionsId = useId();
  const yourTurn = game.turn === 'player';
  const guessing = view.mode === 'guess' && yourTurn;
  const yourAnimal = pack.characters.find((c) => c.id === game.player.secret);
  const answers = answersFor(game, 'player');

  const heading = !yourTurn
    ? "Computer's turn"
    : guessing
      ? 'Your turn: choose an animal to guess'
      : 'Your turn';

  return (
    <section className="tt-turn" aria-labelledby="tt-turn-title">
      <h1 id="tt-turn-title" className="tt-title">
        Tail Trail
      </h1>

      <div className="tt-top">
        {/* Shows what the live region in Game.tsx says; not live itself, so nothing is read twice. */}
        <div ref={banner} className="tt-banner" tabIndex={-1} data-focus-start>
          <p className="tt-banner__turn">{heading}</p>
          <p>{view.log[0] ?? FIRST_TURN}</p>
        </div>
        {yourAnimal && (
          <div className="tt-yours">
            <Sprite character={yourAnimal} size={64} decorative />
            <p>
              <span className="tt-small">Your animal</span>
              <strong className="tt-yours__name">{yourAnimal.name}</strong>
            </p>
          </div>
        )}
      </div>

      <div className="tt-columns">
        <div className="tt-main">
          <div className="tt-modes" role="group" aria-label="Mode">
            <button
              type="button"
              className="tt-button tt-mode"
              aria-pressed={!guessing}
              onClick={() => view.setMode('ask')}
            >
              {!guessing && '✓ '}Ask a question
            </button>
            <button
              type="button"
              className="tt-button tt-mode"
              aria-pressed={guessing}
              disabled={!yourTurn}
              onClick={() => {
                view.setMode('guess');
                // The cards to guess must be on screen on a phone too.
                setPhoneBoard('yours');
              }}
            >
              {guessing && '✓ '}Make a guess
            </button>
          </div>
          {guessing && (
            <p className="tt-notice">
              Guess mode. Choose the animal you think the computer has. A wrong
              guess loses your turn.
            </p>
          )}

          <a
            className="tt-skip"
            href={`#${questionsId}`}
            onClick={(e) => {
              e.preventDefault();
              filterBox.current?.focus();
            }}
          >
            Skip to the questions
          </a>
          <div
            className="tt-board-switch"
            role="group"
            aria-label="Board to show"
          >
            <button
              type="button"
              className="tt-button tt-button--small"
              aria-pressed={phoneBoard === 'yours'}
              onClick={() => setPhoneBoard('yours')}
            >
              Your board
            </button>
            <button
              type="button"
              className="tt-button tt-button--small"
              aria-pressed={phoneBoard === 'computer'}
              onClick={() => setPhoneBoard('computer')}
            >
              Computer&apos;s board
            </button>
          </div>
          <div className={phoneBoard === 'yours' ? '' : 'tt-phone-hidden'}>
            <Board
              pack={pack}
              candidates={game.player.candidates}
              marks={view.marks}
              guessing={guessing}
              onPress={(c) => (guessing ? setPending(c) : view.flipMark(c.id))}
              onResetMarks={view.resetMarks}
            />
          </div>
          <div className={phoneBoard === 'computer' ? '' : 'tt-phone-hidden'}>
            <ComputerBoard pack={pack} candidates={game.computer.candidates} />
          </div>
        </div>

        <div className="tt-side" id={questionsId}>
          <QuestionPicker
            attributes={pack.attributes}
            answers={answers}
            disabled={!yourTurn || guessing}
            filterRef={filterBox}
            onAsk={view.ask}
            onAnnounce={view.announce}
          />
          <section aria-labelledby="tt-log-title">
            <h2 id="tt-log-title" className="tt-heading">
              Game log
            </h2>
            <GameLog entries={view.log} />
          </section>
        </div>
      </div>

      <GuessDialog
        character={pending}
        onCancel={() => {
          // Cancel returns to Ask mode (spec: Asking and guessing).
          setPending(null);
          view.setMode('ask');
        }}
        onConfirm={(c) => {
          // Render the guess first: the banner must show its result when focus arrives,
          // because focus is what reads it (spec: Focus, Announcements).
          flushSync(() => {
            setPending(null);
            view.guess(c.id);
          });
          // A wrong guess keeps this screen; focus goes to the banner (spec: Focus).
          banner.current?.focus();
        }}
      />
    </section>
  );
}
