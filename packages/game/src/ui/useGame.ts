/** The one hook that wraps the engine; components only render what it returns. */
import { useEffect, useRef, useState } from 'react';
import type { BoardPack } from '../engine/board';
import { computerMove } from '../engine/computer';
import {
  askQuestion,
  createGame,
  gameResult,
  makeGuess,
  type Difficulty,
  type GameResult,
  type GameState,
} from '../engine/game';
import { toggleMark, type ManualMarks } from '../engine/marks';
import { describeMove } from '../engine/messages';
import { createRandom, type Random } from '../engine/random';

/** How long the computer waits before its move, so a screen reader finishes first (spec: Pace). */
export const COMPUTER_PAUSE_MS = 600;

/** The four screens of the game. */
export type Screen = 'start' | 'pick' | 'turn' | 'over';

/** Whether a card press flips its mark or chooses it for a guess. */
export type Mode = 'ask' | 'guess';

/** Callbacks the site can pass in. */
export interface GameCallbacks {
  onGameStart?: (info: { difficulty: Difficulty; packId: string }) => void;
  onGameEnd?: (result: GameResult) => void;
}

/** Everything the screens show, and the actions they can take. */
export interface GameView {
  screen: Screen;
  difficulty: Difficulty;
  /** The game in play; null before the first start. */
  game: GameState | null;
  marks: ManualMarks;
  mode: Mode;
  /** Every move in words, newest first. */
  log: string[];
  chooseDifficulty: (difficulty: Difficulty) => void;
  goToPick: () => void;
  goToStart: () => void;
  /** Starts a game with the player's pick, or a random one when left out. */
  start: (playerSecret?: string) => void;
  ask: (attributeId: string) => void;
  guess: (characterId: string) => void;
  flipMark: (characterId: string) => void;
  resetMarks: () => void;
  setMode: (mode: Mode) => void;
}

/** Game state and actions for one mounted game; `seed` fixes every random choice. */
export function useGame(
  pack: BoardPack,
  seed: string | number | undefined,
  callbacks: GameCallbacks,
): GameView {
  const [random] = useState<Random>(() => createRandom(seed ?? Date.now()));
  const [screen, setScreen] = useState<Screen>('start');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [game, setGame] = useState<GameState | null>(null);
  const [marks, setMarks] = useState<ManualMarks>({});
  const [mode, setMode] = useState<Mode>('ask');
  const [log, setLog] = useState<string[]>([]);
  // The latest callbacks, so the computer's timer never calls an old one.
  const latest = useRef(callbacks);
  latest.current = callbacks;

  /** Shows the state after a move: log it, and end the game if someone won. */
  function apply(next: GameState): void {
    const move = next.history.at(-1);
    setGame(next);
    if (move) {
      setLog((entries) => [describeMove(next, move), ...entries]);
    }
    const result = gameResult(next);
    if (result) {
      setScreen('over');
      latest.current.onGameEnd?.(result);
    }
  }

  // The computer moves after a short pause whenever it is its turn.
  useEffect(() => {
    if (!game || game.winner !== null || game.turn !== 'computer') {
      return;
    }
    const timer = setTimeout(() => {
      const move = computerMove(game, random);
      apply(
        move.kind === 'ask'
          ? askQuestion(game, move.attributeId)
          : makeGuess(game, move.characterId),
      );
    }, COMPUTER_PAUSE_MS);
    return () => clearTimeout(timer);
    // apply only uses setters and the callbacks ref, so it can be left out.
  }, [game, random]);

  return {
    screen,
    difficulty,
    game,
    marks,
    mode,
    log,
    chooseDifficulty: setDifficulty,
    goToPick: () => setScreen('pick'),
    goToStart: () => setScreen('start'),
    start: (playerSecret) => {
      setGame(createGame({ pack, difficulty, random, playerSecret }));
      setMarks({});
      setMode('ask');
      setLog([]);
      setScreen('turn');
      latest.current.onGameStart?.({ difficulty, packId: pack.id });
    },
    ask: (attributeId) => game && apply(askQuestion(game, attributeId)),
    guess: (characterId) => {
      if (game) {
        setMode('ask');
        // A wrong guess rules the card out for sure, so it replaces a manual "still in".
        setMarks((m) => ({ ...m, [characterId]: true }));
        apply(makeGuess(game, characterId));
      }
    },
    flipMark: (characterId) =>
      game &&
      setMarks((m) => toggleMark(characterId, game.player.candidates, m)),
    resetMarks: () => setMarks({}),
    setMode,
  };
}
