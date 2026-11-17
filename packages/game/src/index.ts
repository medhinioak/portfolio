/** Public entry point of the game package; the site imports only from here (ADR-0002). */
export { clamp } from './engine/clamp';
export { Game } from './ui/Game';
export type { GameProps } from './ui/Game';
export { filterQuestions, questionGroups } from './engine/questions';
export { describeMove } from './engine/messages';
export { validateBoardPack } from './engine/validate';
export {
  bestQuestions,
  computerMove,
  randomChance,
  usefulQuestions,
} from './engine/computer';
export type { ComputerMove } from './engine/computer';
export {
  answersFor,
  askedQuestions,
  askQuestion,
  createGame,
  gameResult,
  makeGuess,
} from './engine/game';
export type {
  Difficulty,
  GameResult,
  GameState,
  Move,
  NewGameOptions,
  Side,
  SideState,
} from './engine/game';
export { createRandom } from './engine/random';
export type { Random } from './engine/random';
export { animalsBoard } from './boards';
export type {
  Attribute,
  BoardPack,
  Character,
  ValidationError,
  ValidationResult,
} from './engine/board';
