/** Keyboard movement in a grid of cards: one tab stop, arrow keys inside (spec: Keyboard). */
import {
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type RefObject,
} from 'react';

/** The card to move to for `key`, or null when the key does not move. Never wraps. */
export function nextCardIndex(
  index: number,
  key: string,
  ctrl: boolean,
  columns: number,
  count: number,
): number | null {
  const rowStart = index - (index % columns);
  const rowEnd = Math.min(rowStart + columns, count) - 1;
  switch (key) {
    case 'ArrowLeft':
      return index % columns === 0 ? index : index - 1;
    case 'ArrowRight':
      return index === rowEnd ? index : index + 1;
    case 'ArrowUp':
      return index - columns >= 0 ? index - columns : index;
    case 'ArrowDown':
      return index + columns < count ? index + columns : index;
    case 'Home':
      return ctrl ? 0 : rowStart;
    case 'End':
      return ctrl ? count - 1 : rowEnd;
    default:
      return null;
  }
}

/** What a grid of cards needs: its ref, each card's tabIndex and the key handler. */
export interface CardGrid {
  ref: RefObject<HTMLDivElement | null>;
  tabIndexFor: (index: number) => 0 | -1;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  /** Keeps the tab stop on the card focused last, by keyboard or pointer. */
  onFocus: (event: FocusEvent<HTMLDivElement>) => void;
}

/** Makes a grid of `count` buttons one tab stop; the columns follow the laid-out rows. */
export function useCardGrid(count: number): CardGrid {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  /** The grid's buttons and the index of the one an event came from. */
  function locate(target: EventTarget): [HTMLButtonElement[], number] {
    const buttons = ref.current
      ? [...ref.current.querySelectorAll('button')]
      : [];
    return [buttons, buttons.indexOf(target as HTMLButtonElement)];
  }

  return {
    ref,
    tabIndexFor: (index) => (index === active ? 0 : -1),
    onKeyDown: (event) => {
      const grid = ref.current;
      const [buttons, index] = locate(event.target);
      if (!grid || index < 0) return;
      // The cards on the first row: whatever the CSS grid does, this is the column count.
      const firstTop = buttons[0]?.offsetTop;
      const columns = buttons.filter((b) => b.offsetTop === firstTop).length;
      const next = nextCardIndex(
        index,
        event.key,
        event.ctrlKey || event.metaKey,
        Math.max(columns, 1),
        Math.min(count, buttons.length),
      );
      if (next === null) return;
      event.preventDefault();
      setActive(next);
      buttons[next]?.focus();
    },
    onFocus: (event) => {
      const [, index] = locate(event.target);
      if (index >= 0) setActive(index);
    },
  };
}
