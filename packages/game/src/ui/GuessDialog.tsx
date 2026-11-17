/** The guess confirmation: nothing is guessed on a single press. */
import { useEffect, useRef, type ReactElement } from 'react';
import type { Character } from '../engine/board';

/** Props for {@link GuessDialog}. */
export interface GuessDialogProps {
  /** The card chosen for a guess; null keeps the dialog closed. */
  character: Character | null;
  onConfirm: (character: Character) => void;
  onCancel: () => void;
}

/** A native modal dialog; focus starts on Cancel and Escape cancels. */
export function GuessDialog({
  character,
  onConfirm,
  onCancel,
}: GuessDialogProps): ReactElement {
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (character && !element.open) {
      element.showModal();
      cancel.current?.focus();
    } else if (!character && element.open) {
      // close() returns focus to the card that opened the dialog.
      element.close();
    }
  }, [character]);

  const name = character?.name.toLowerCase() ?? '';
  return (
    <dialog
      ref={dialog}
      className="tt-dialog"
      aria-labelledby="tt-dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
    >
      <h2 id="tt-dialog-title" className="tt-heading">
        Guess the {name}?
      </h2>
      <p>
        If it is not the computer&apos;s animal, you lose this turn and the{' '}
        {name} is marked as ruled out.
      </p>
      <div className="tt-actions">
        <button
          type="button"
          className="tt-button tt-button--primary"
          onClick={() => {
            if (!character) return;
            // Close first, so the caller can move focus somewhere other than the card.
            dialog.current?.close();
            onConfirm(character);
          }}
        >
          Yes, guess the {name}
        </button>
        <button
          ref={cancel}
          type="button"
          className="tt-button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </dialog>
  );
}
