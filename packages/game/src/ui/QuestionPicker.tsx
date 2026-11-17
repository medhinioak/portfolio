/** The question list with its filter box and group buttons (ADR-0013). */
import { useId, useRef, useState, type ReactElement } from 'react';
import type { Attribute } from '../engine/board';
import {
  ALL_GROUPS,
  filterQuestions,
  questionGroups,
} from '../engine/questions';

/** Props for {@link QuestionPicker}. */
export interface QuestionPickerProps {
  attributes: readonly Attribute[];
  /** The player's answers so far, by question id. */
  answers: ReadonlyMap<string, boolean>;
  /** True on the computer's turn and in guess mode. */
  disabled: boolean;
  onAsk: (attributeId: string) => void;
}

/** Filter box, group buttons and the scrolling list; only a question button asks. */
export function QuestionPicker({
  attributes,
  answers,
  disabled,
  onAsk,
}: QuestionPickerProps): ReactElement {
  const [text, setText] = useState('');
  const [group, setGroup] = useState(ALL_GROUPS);
  const filterBox = useRef<HTMLInputElement>(null);
  // Unique ids: group names may contain spaces, and a page may hold two games.
  const id = useId();
  const shown = filterQuestions(attributes, text, group);
  const filtering = text.trim() !== '' || group !== ALL_GROUPS;

  /** Asks, then moves focus to the filter box: the asked button is now disabled. */
  function ask(id: string): void {
    onAsk(id);
    filterBox.current?.focus();
  }

  return (
    <section className="tt-questions" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="tt-heading">
        Ask a question
      </h2>
      <p className="tt-muted">
        {filtering
          ? `${shown.length} of ${attributes.length} questions match`
          : `${attributes.length} questions`}
      </p>

      <label className="tt-label" htmlFor={`${id}-filter`}>
        Filter questions
      </label>
      <div className="tt-filter">
        <input
          id={`${id}-filter`}
          ref={filterBox}
          type="search"
          autoComplete="off"
          placeholder="Type to filter, for example wings"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setText('');
            // Enter never asks a question; only a question button does.
            if (e.key === 'Enter') e.preventDefault();
          }}
        />
      </div>

      <div className="tt-groups" role="group" aria-label="Question groups">
        {[ALL_GROUPS, ...questionGroups(attributes)].map((g) => (
          <button
            key={g}
            type="button"
            className="tt-button tt-button--small"
            aria-pressed={group === g}
            onClick={() => setGroup(g)}
          >
            {group === g && '✓ '}
            {g}
          </button>
        ))}
      </div>

      <div className="tt-list">
        {shown.length === 0 && (
          <p>
            No question matches.{' '}
            <button
              type="button"
              className="tt-link"
              onClick={() => {
                setText('');
                setGroup(ALL_GROUPS);
              }}
            >
              Clear the filter.
            </button>
          </p>
        )}
        {questionGroups(shown).map((g, i) => (
          <div key={g} role="group" aria-labelledby={`${id}-group-${i}`}>
            <h3 id={`${id}-group-${i}`} className="tt-list__group">
              {g}
            </h3>
            {shown
              .filter((a) => a.group === g)
              .map((a) => {
                const answer = answers.get(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    className="tt-question"
                    disabled={disabled || answer !== undefined}
                    onClick={() => ask(a.id)}
                  >
                    <span>{a.question}</span>
                    {answer !== undefined && (
                      <span className="tt-question__answer">
                        ✓ {answer ? 'Yes' : 'No'}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        ))}
      </div>
    </section>
  );
}
