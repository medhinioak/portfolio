/** The words for each move, shared by the turn banner and the game log (docs/game/spec.md, Announcements). */
import type { BoardPack } from './board';
import type { GameState, Move } from './game';

/** A character's display name, or its id if the pack has no such character. */
function nameOf(pack: BoardPack, id: string): string {
  return pack.characters.find((c) => c.id === id)?.name ?? id;
}

/** "the tiger": a name inside a sentence. */
function theName(pack: BoardPack, id: string): string {
  return `the ${nameOf(pack, id).toLowerCase()}`;
}

/** Describes `move` in a full sentence; `after` is the game state right after it. */
export function describeMove(after: GameState, move: Move): string {
  const { pack } = after;
  if (move.kind === 'ask') {
    const question =
      pack.attributes.find((a) => a.id === move.attributeId)?.question ??
      move.attributeId;
    const answer = `The answer is ${move.answer ? 'yes' : 'no'}.`;
    if (move.side === 'computer') {
      return `The computer asked: ${question} ${answer}`;
    }
    const left = after.player.candidates.length;
    return `You asked: ${question} ${answer} ${left} of ${pack.characters.length} animals are still in.`;
  }
  const name = nameOf(pack, move.characterId);
  if (move.side === 'player') {
    return move.correct
      ? `You won. The computer's animal was ${theName(pack, move.characterId)}.`
      : `You guessed ${name}. That is not it. You lose this turn.`;
  }
  return move.correct
    ? `The computer won. It guessed your animal: ${theName(pack, move.characterId)}.`
    : `The computer guessed ${name}. That is not it.`;
}
