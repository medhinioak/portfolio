/** Three-way theme toggle (system, light, dark). Behaviour: docs/design/tokens.md#theme. */
import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';

type Mode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'theme';
const NEXT: Record<Mode, Mode> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
};
const MODES: Mode[] = ['system', 'light', 'dark'];
const LABEL: Record<Mode, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};
const darkQuery = '(prefers-color-scheme: dark)';

function readMode(): Mode {
  return parseMode(document.documentElement.dataset.theme);
}

function parseMode(value: string | null | undefined): Mode {
  return value === 'light' || value === 'dark' ? value : 'system';
}

function systemIsDark(): boolean {
  return window.matchMedia(darkQuery).matches;
}

/** Saves light/dark; system removes the key. Storage may be blocked, so failures are ignored. */
function saveMode(mode: Mode): void {
  try {
    if (mode === 'system') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  } catch {
    // The choice just isn't remembered.
  }
}

export default function ThemeToggle(): ReactElement {
  // null until hydrated, so the server markup and the first client render match.
  const [mode, setMode] = useState<Mode | null>(null);
  const [dark, setDark] = useState(false);
  // Announced by a polite live region after a click; empty on load so nothing is read out.
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    setMode(readMode());
    setDark(systemIsDark());
    const query = window.matchMedia(darkQuery);
    const onChange = (event: MediaQueryListEvent): void =>
      setDark(event.matches);
    query.addEventListener('change', onChange);

    // Another tab changed the theme: follow it.
    const onStorage = (event: StorageEvent): void => {
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      const next = parseMode(event.newValue);
      document.documentElement.dataset.theme = next;
      setMode(next);
    };
    window.addEventListener('storage', onStorage);

    return () => {
      query.removeEventListener('change', onChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  function cycle(): void {
    const next = NEXT[mode ?? readMode()];
    document.documentElement.dataset.theme = next;
    saveMode(next);
    setMode(next);
    const shown =
      next === 'system'
        ? `system (${systemIsDark() ? 'dark' : 'light'})`
        : next;
    setAnnouncement(`Theme set to ${shown}`);
  }

  const resolved = mode === 'system' ? ` (${dark ? 'dark' : 'light'})` : '';

  return (
    <>
      <button type="button" className="theme-toggle label" onClick={cycle}>
        Theme:{' '}
        {/* All three are in the server markup; CSS shows the one matching data-theme,
            which the head script sets before first paint. So the label is right on the
            first frame and does not change (or resize the header) on hydration. */}
        {MODES.map((m) => (
          <span key={m} className="theme-toggle-mode" data-mode={m}>
            {LABEL[m]}
          </span>
        ))}
        <span className="visually-hidden">{resolved}. Change theme</span>
      </button>
      <span className="visually-hidden" role="status" aria-live="polite">
        {announcement}
      </span>
    </>
  );
}
