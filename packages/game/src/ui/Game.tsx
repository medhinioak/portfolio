/** The game component, a React island on /play (docs/game/spec.md, Package API). */
import { useEffect, useRef, type ReactElement } from 'react';
import { animalsBoard } from '../boards';
import type { BoardPack } from '../engine/board';
import type { Difficulty, GameResult } from '../engine/game';
import { EndScreen } from './EndScreen';
import { PickScreen } from './PickScreen';
import { StartScreen } from './StartScreen';
import { TurnScreen } from './TurnScreen';
import { useGame } from './useGame';
import './game.css';

/** Props for {@link Game}; the site decides what to do with the callbacks. */
export interface GameProps {
  /** The board to play; default: the animals board. */
  pack?: BoardPack;
  /** Fixes the random choices; default: random. */
  seed?: string | number;
  onGameStart?: (info: { difficulty: Difficulty; packId: string }) => void;
  onGameEnd?: (result: GameResult) => void;
  /** Where "Back to Home" goes; the site decides. Default: "/". */
  homeHref?: string;
}

/** Start, pick, turn and end screens, themed only by `--game-*` custom properties. */
export function Game({
  pack = animalsBoard,
  seed,
  onGameStart,
  onGameEnd,
  homeHref = '/',
}: GameProps): ReactElement {
  const view = useGame(pack, seed, { onGameStart, onGameEnd });
  const { screen, game } = view;
  const root = useRef<HTMLDivElement>(null);
  const shownScreen = useRef(screen);

  // A new screen replaces the old one's controls, so focus would fall to the page body.
  // Move it to the new screen's start instead; never on page load (spec: Focus).
  useEffect(() => {
    // Comparing screens, not counting renders, stays right when StrictMode runs effects twice.
    if (shownScreen.current === screen) return;
    shownScreen.current = screen;
    root.current?.querySelector<HTMLElement>('[data-focus-start]')?.focus();
  }, [screen]);

  return (
    <div ref={root} className="tt-game">
      {/* The game's one polite live region; it stays mounted on every screen. */}
      <p className="tt-sr-only" role="status">
        {view.announcement}
      </p>
      {screen === 'start' && (
        <StartScreen
          pack={pack}
          difficulty={view.difficulty}
          onChoose={view.chooseDifficulty}
          onNext={view.goToPick}
        />
      )}
      {screen === 'pick' && (
        <PickScreen
          pack={pack}
          difficulty={view.difficulty}
          onStart={view.start}
          onBack={view.goToStart}
        />
      )}
      {screen === 'turn' && game && <TurnScreen view={view} game={game} />}
      {screen === 'over' && game && (
        <EndScreen
          game={game}
          log={view.log}
          homeHref={homeHref}
          onPlayAgain={view.goToPick}
          onChangeDifficulty={view.goToStart}
        />
      )}
    </div>
  );
}
