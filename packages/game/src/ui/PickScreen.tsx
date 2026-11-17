/** The pick screen: the player chooses their secret animal, or lets the game choose. */
import { useState, type ReactElement } from 'react';
import type { BoardPack } from '../engine/board';
import type { Difficulty } from '../engine/game';
import { Card } from './Card';
import { DIFFICULTY_LABELS } from './labels';

/** Props for {@link PickScreen}. */
export interface PickScreenProps {
  pack: BoardPack;
  difficulty: Difficulty;
  /** Starts the game with this pick; undefined means "Surprise me". */
  onStart: (characterId?: string) => void;
  onBack: () => void;
}

/** All cards; one press marks "your pick", and the main button starts with it. */
export function PickScreen({
  pack,
  difficulty,
  onStart,
  onBack,
}: PickScreenProps): ReactElement {
  const [pick, setPick] = useState<string | null>(null);
  const picked = pack.characters.find((c) => c.id === pick);
  return (
    <section className="tt-column" aria-labelledby="tt-pick-title">
      <h1 className="tt-title">Tail Trail</h1>
      <h2 id="tt-pick-title" className="tt-heading">
        Pick your animal
      </h2>
      <p>
        The computer has to guess this animal. It never sees your pick, only
        your answers.
      </p>
      <p className="tt-small">
        Difficulty: {DIFFICULTY_LABELS[difficulty].name}
      </p>
      <div className="tt-grid">
        {pack.characters.map((c) => (
          <Card
            key={c.id}
            character={c}
            picked={c.id === pick}
            onPress={() => setPick(c.id)}
          />
        ))}
      </div>
      <div className="tt-actions">
        <button
          type="button"
          className="tt-button tt-button--primary"
          disabled={!picked}
          onClick={() => picked && onStart(picked.id)}
        >
          {picked
            ? `Start with the ${picked.name.toLowerCase()}`
            : 'Pick an animal to start'}
        </button>
        <button type="button" className="tt-button" onClick={() => onStart()}>
          Surprise me
        </button>
        <button type="button" className="tt-button" onClick={onBack}>
          Back
        </button>
      </div>
    </section>
  );
}
