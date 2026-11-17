/** The computer's board: what it still thinks the player's animal could be. Read-only. */
import type { ReactElement } from 'react';
import type { BoardPack } from '../engine/board';
import { Sprite } from './Sprite';

/** Props for {@link ComputerBoard}. */
export interface ComputerBoardProps {
  pack: BoardPack;
  /** The computer's candidates: only what the player's answers told it. */
  candidates: readonly string[];
}

/** A list of small chips, "Penguin, still in"; nothing here is a tab stop. */
export function ComputerBoard({
  pack,
  candidates,
}: ComputerBoardProps): ReactElement {
  return (
    <section className="tt-computer" aria-labelledby="tt-computer-title">
      <h2 id="tt-computer-title" className="tt-heading">
        Computer&apos;s board
      </h2>
      <p className="tt-muted">
        What the computer thinks your animal could be: {candidates.length} of{' '}
        {pack.characters.length} still in. You cannot change it.
      </p>
      <ul className="tt-chips">
        {pack.characters.map((c) => {
          const out = !candidates.includes(c.id);
          return (
            <li key={c.id} className={out ? 'tt-chip tt-chip--out' : 'tt-chip'}>
              <Sprite character={c} size={32} decorative />
              <span>
                <span className="tt-chip__name">{c.name}</span>
                <span className="tt-chip__note">
                  <span className="tt-sr-only">, </span>
                  {out ? 'ruled out' : 'still in'}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
