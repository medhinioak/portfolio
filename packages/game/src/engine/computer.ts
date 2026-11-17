/** The computer opponent: which question it asks and when it guesses (docs/game/spec.md, Computer opponent). */
import { askedQuestions, type Difficulty, type GameState } from './game';
import { pickOne, type Random } from './random';

/** What the computer does on its turn. */
export type ComputerMove =
  { kind: 'ask'; attributeId: string } | { kind: 'guess'; characterId: string };

/** How often each difficulty ignores the best question and asks a random useful one. */
export const randomChance: Readonly<Record<Difficulty, number>> = {
  easy: 0.6,
  medium: 0.3,
  hard: 0,
};

/** How many of `candidates` answer yes to the question `attributeId`. */
function countYes(
  state: GameState,
  candidates: readonly string[],
  attributeId: string,
): number {
  return state.pack.characters.filter(
    (c) => candidates.includes(c.id) && c.values[attributeId] === true,
  ).length;
}

/** The questions the computer has not asked that split its candidates into two groups. */
export function usefulQuestions(state: GameState): string[] {
  const { candidates } = state.computer;
  const asked = askedQuestions(state, 'computer');
  return state.pack.attributes
    .map((a) => a.id)
    .filter((id) => !asked.includes(id))
    .filter((id) => {
      const yes = countYes(state, candidates, id);
      return yes > 0 && yes < candidates.length;
    });
}

/** The useful questions whose yes count is closest to half the candidates; empty if none is useful. */
export function bestQuestions(state: GameState): string[] {
  const half = state.computer.candidates.length / 2;
  const distance = (id: string): number =>
    Math.abs(countYes(state, state.computer.candidates, id) - half);
  const useful = usefulQuestions(state);
  const closest = Math.min(...useful.map(distance));
  return useful.filter((id) => distance(id) === closest);
}

/** The computer's move: guess its last candidate, otherwise ask a question for its difficulty. */
export function computerMove(state: GameState, random: Random): ComputerMove {
  if (state.winner !== null || state.turn !== 'computer') {
    throw new Error("It is not the computer's turn");
  }
  const { candidates } = state.computer;
  const useful = usefulQuestions(state);
  // One candidate left, or none of the questions can tell the rest apart: guess.
  if (candidates.length === 1 || useful.length === 0) {
    return { kind: 'guess', characterId: pickOne(candidates, random) };
  }
  const choices =
    random() < randomChance[state.difficulty] ? useful : bestQuestions(state);
  return { kind: 'ask', attributeId: pickOne(choices, random) };
}
