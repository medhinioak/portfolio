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
const LABEL: Record<Mode, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};
const darkQuery = '(prefers-color-scheme: dark)';

function readMode(): Mode {
  const value = document.documentElement.dataset.theme;
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

  useEffect(() => {
    setMode(readMode());
    setDark(systemIsDark());
    const query = window.matchMedia(darkQuery);
    const onChange = (event: MediaQueryListEvent): void =>
      setDark(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  function cycle(): void {
    const next = NEXT[mode ?? readMode()];
    document.documentElement.dataset.theme = next;
    saveMode(next);
    setMode(next);
  }

  const resolved = mode === 'system' ? ` (${dark ? 'dark' : 'light'})` : '';

  return (
    <button type="button" className="theme-toggle label" onClick={cycle}>
      Theme: {mode ? LABEL[mode] : '…'}
      <span className="visually-hidden">{resolved}. Change theme</span>
    </button>
  );
}
