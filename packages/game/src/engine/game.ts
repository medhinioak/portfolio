/** The deduction engine: game state and moves (docs/game/spec.md, Rules and turn flow). */
import type { BoardPack } from './board';
import { pickOne, type Random } from './random';

/** One of the two players. */
export type Side = 'player' | 'computer';

/** How well the computer picks its questions (ids from the spec). */
export type Difficulty = 'easy' | 'medium' | 'hard';

/** One move in the game, as it happened. */
export type Move =
  | { side: Side; kind: 'ask'; attributeId: string; answer: boolean }
  | { side: Side; kind: 'guess'; characterId: string; correct: boolean };

/** What one side knows: its own secret and what the other's could still be. */
export interface SideState {
  /** This side's own secret character id. */
  secret: string;
  /** Character ids this side has not ruled out for the other side's secret. */
  candidates: string[];
}

/** The whole game as plain data; moves return a new state. */
export interface GameState {
  pack: BoardPack;
  difficulty: Difficulty;
  turn: Side;
  winner: Side | null;
  player: SideState;
  computer: SideState;
  /** Every move in order; the log, the banner and the asked questions come from it. */
  history: Move[];
}

/** The summary of a finished game (the spec's onGameEnd payload). */
export interface GameResult {
  winner: Side;
  difficulty: Difficulty;
  packId: string;
  /** Total turns, both sides. */
  turns: number;
  /** Questions asked by the player. */
  questionsAsked: number;
  /** Wrong guesses by the player. */
  wrongGuesses: number;
}

/** Options for a new game. */
export interface NewGameOptions {
  pack: BoardPack;
  difficulty: Difficulty;
  random: Random;
  /** The player's pick; left out, it is picked at random ("Surprise me"). */
  playerSecret?: string;
}

/** The side that is not `side`. */
function other(side: Side): Side {
  return side === 'player' ? 'computer' : 'player';
}

/** Returns `state` with one side's knowledge replaced. */
function withSide(state: GameState, side: Side, next: SideState): GameState {
  return side === 'player'
    ? { ...state, player: next }
    : { ...state, computer: next };
}

/** Throws if the game is over; moves are only allowed while it is on. */
function assertInPlay(state: GameState): void {
  if (state.winner !== null) {
    throw new Error('The game is over; no more moves');
  }
}

/** Starts a game: the player moves first and every character is still in. */
export function createGame(options: NewGameOptions): GameState {
  const { pack, difficulty, random, playerSecret } = options;
  const ids = pack.characters.map((c) => c.id);
  if (playerSecret !== undefined && !ids.includes(playerSecret)) {
    throw new Error(`Unknown character: ${playerSecret}`);
  }
  // The computer draws first, so a seed gives the same computer animal either way.
  const computer = pickOne(ids, random);
  const player = playerSecret ?? pickOne(ids, random);
  return {
    pack,
    difficulty,
    turn: 'player',
    winner: null,
    player: { secret: player, candidates: [...ids] },
    computer: { secret: computer, candidates: [...ids] },
    history: [],
  };
}

/** The attribute ids that `side` has asked so far, in order. */
export function askedQuestions(state: GameState, side: Side): string[] {
  return state.history.flatMap((m) =>
    m.side === side && m.kind === 'ask' ? [m.attributeId] : [],
  );
}

/** The answers `side` has been given so far, by question id. */
export function answersFor(state: GameState, side: Side): Map<string, boolean> {
  return new Map(
    state.history.flatMap((m) =>
      m.side === side && m.kind === 'ask'
        ? [[m.attributeId, m.answer] as const]
        : [],
    ),
  );
}

/** The side to move asks a question; the true answer rules out the cards that disagree. */
export function askQuestion(state: GameState, attributeId: string): GameState {
  assertInPlay(state);
  if (!state.pack.attributes.some((a) => a.id === attributeId)) {
    throw new Error(`Unknown question: ${attributeId}`);
  }
  const side = state.turn;
  if (askedQuestions(state, side).includes(attributeId)) {
    throw new Error(`The ${side} has already asked: ${attributeId}`);
  }
  const secret = state[other(side)].secret;
  const answer = state.pack.characters.some(
    (c) => c.id === secret && c.values[attributeId] === true,
  );
  const mine = state[side];
  const agree = new Set(
    state.pack.characters
      .filter((c) => (c.values[attributeId] === true) === answer)
      .map((c) => c.id),
  );
  return {
    ...withSide(state, side, {
      ...mine,
      candidates: mine.candidates.filter((id) => agree.has(id)),
    }),
    turn: other(side),
    history: [...state.history, { side, kind: 'ask', attributeId, answer }],
  };
}

/** The side to move guesses: right wins, wrong rules that card out and loses the turn. */
export function makeGuess(state: GameState, characterId: string): GameState {
  assertInPlay(state);
  if (!state.pack.characters.some((c) => c.id === characterId)) {
    throw new Error(`Unknown character: ${characterId}`);
  }
  const side = state.turn;
  const correct = state[other(side)].secret === characterId;
  const history: Move[] = [
    ...state.history,
    { side, kind: 'guess', characterId, correct },
  ];
  if (correct) {
    return { ...state, winner: side, history };
  }
  const mine = state[side];
  return {
    ...withSide(state, side, {
      ...mine,
      candidates: mine.candidates.filter((id) => id !== characterId),
    }),
    turn: other(side),
    history,
  };
}

/** The result of a finished game, or null while it is still on. */
export function gameResult(state: GameState): GameResult | null {
  if (state.winner === null) {
    return null;
  }
  return {
    winner: state.winner,
    difficulty: state.difficulty,
    packId: state.pack.id,
    turns: state.history.length,
    questionsAsked: askedQuestions(state, 'player').length,
    wrongGuesses: state.history.filter(
      (m) => m.side === 'player' && m.kind === 'guess' && !m.correct,
    ).length,
  };
}
