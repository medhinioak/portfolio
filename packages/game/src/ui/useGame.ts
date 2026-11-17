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

/** What the banner says when a game starts; focus moves to it, so it is read then. */
export const FIRST_TURN = 'You go first. Ask a question or make a guess.';

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
  /** The latest text for the game's one polite live region. */
  announcement: string;
  /** Says `text` through the live region (for example the filter count). */
  announce: (text: string) => void;
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
  const [announcement, setAnnouncement] = useState('');

  /** Puts `text` in the live region; a repeat gets a different invisible ending so it is read again. */
  function announce(text: string): void {
    setAnnouncement((last) => (last === text ? `${text}\u00a0` : text));
  }
  // The latest callbacks, so the computer's timer never calls an old one.
  const latest = useRef(callbacks);
  latest.current = callbacks;

  /**
   * Shows the state after a move: log it, announce it, and end the game if someone won.
   * `quiet` skips the announcement when focus moves to the banner, which reads the same text.
   */
  function apply(next: GameState, quiet = false): void {
    const move = next.history.at(-1);
    setGame(next);
    if (move) {
      const text = describeMove(next, move);
      setLog((entries) => [text, ...entries]);
      // Then whose turn it is, in the order the spec lists (Announcements).
      const turn =
        next.winner !== null
          ? ''
          : next.turn === 'computer'
            ? " Computer's turn."
            : ' Your turn.';
      if (!quiet) announce(text + turn);
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
    announcement,
    announce,
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
    ask: (attributeId) => {
      if (game) apply(askQuestion(game, attributeId));
    },
    guess: (characterId) => {
      if (game) {
        setMode('ask');
        // A wrong guess rules the card out for sure, so it replaces a manual "still in".
        setMarks((m) => ({ ...m, [characterId]: true }));
        const next = makeGuess(game, characterId);
        // A wrong guess moves focus to the banner, which reads it (spec: Focus).
        apply(next, next.winner === null);
      }
    },
    flipMark: (characterId) => {
      if (game) {
        setMarks((m) => toggleMark(characterId, game.player.candidates, m));
      }
    },
    resetMarks: () => setMarks({}),
    setMode,
  };
}
