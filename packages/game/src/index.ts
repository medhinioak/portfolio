/** Public entry point of the game package; the site imports only from here (ADR-0002). */
export { clamp } from './engine/clamp';
export { validateBoardPack } from './engine/validate';
export { animalsBoard } from './boards';
export type {
  Attribute,
  BoardPack,
  Character,
  ValidationError,
  ValidationResult,
} from './engine/board';
