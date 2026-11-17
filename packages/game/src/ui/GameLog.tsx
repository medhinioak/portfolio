/** The game log: every move in words, newest first. */
import type { ReactElement } from 'react';

/** Props for {@link GameLog}. */
export interface GameLogProps {
  entries: readonly string[];
}

/** The same sentences the turn banner announces, kept as a history. */
export function GameLog({ entries }: GameLogProps): ReactElement {
  return (
    <ol className="tt-log" reversed>
      {entries.map((entry, i) => (
        // Entries are only ever added at the front, so the count from the end is stable.
        <li key={entries.length - i}>{entry}</li>
      ))}
    </ol>
  );
}
