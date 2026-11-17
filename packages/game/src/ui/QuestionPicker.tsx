/** The question list with its filter box and group buttons (ADR-0013). */
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type RefObject,
} from 'react';
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
  /** The filter box; the Turn screen's skip link and asking move focus to it. */
  filterRef: RefObject<HTMLInputElement | null>;
  onAsk: (attributeId: string) => void;
  /** Says the match count through the game's live region. */
  onAnnounce: (text: string) => void;
}

/** How long the filter waits after typing stops before it announces the count. */
const ANNOUNCE_PAUSE_MS = 500;

/** Filter box, group buttons and the scrolling list; only a question button asks. */
export function QuestionPicker({
  attributes,
  answers,
  disabled,
  filterRef,
  onAsk,
  onAnnounce,
}: QuestionPickerProps): ReactElement {
  const [text, setText] = useState('');
  const [group, setGroup] = useState(ALL_GROUPS);
  // Unique ids: group names may contain spaces, and a page may hold two games.
  const id = useId();
  const shown = filterQuestions(attributes, text, group);
  const filtering = text.trim() !== '' || group !== ALL_GROUPS;

  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  /** Changes the filter, then says the new count once typing pauses (spec: Announcements). */
  function changeFilter(nextText: string, nextGroup: string): void {
    setText(nextText);
    setGroup(nextGroup);
    clearTimeout(timer.current);
    const typed = nextText.trim();
    if (typed === '' && nextGroup === ALL_GROUPS) return;
    const count = filterQuestions(attributes, nextText, nextGroup).length;
    const of = `${count} of ${attributes.length} questions`;
    const message = typed ? `${of} match ${typed}.` : `${of} in ${nextGroup}.`;
    timer.current = setTimeout(() => onAnnounce(message), ANNOUNCE_PAUSE_MS);
  }

  /** Asks, then moves focus to the filter box: the asked button is now disabled. */
  function ask(id: string): void {
    onAsk(id);
    filterRef.current?.focus();
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
          ref={filterRef}
          type="search"
          autoComplete="off"
          placeholder="Type to filter, for example wings"
          value={text}
          onChange={(e) => changeFilter(e.target.value, group)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') changeFilter('', group);
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
            onClick={() => changeFilter(text, g)}
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
              onClick={() => changeFilter('', ALL_GROUPS)}
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
