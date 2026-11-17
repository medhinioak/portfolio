/** Playground: plays the game without the site (`pnpm --filter game dev`). */
import { StrictMode, useState, type ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import { Game } from '../src/index';
import './playground.css';

type Theme = 'system' | 'light' | 'dark';
const next: Record<Theme, Theme> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
};

/** A theme button like the site's, so both themes can be checked here. */
function Playground(): ReactElement {
  const [theme, setTheme] = useState<Theme>('system');
  const change = (): void => {
    const value = next[theme];
    setTheme(value);
    if (value === 'system') {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = value;
    }
  };
  return (
    <>
      <div className="playground-bar">
        <button type="button" onClick={change}>
          Theme: {theme}
        </button>
      </div>
      <main>
        <Game
          seed={new URLSearchParams(location.search).get('seed') ?? undefined}
          onGameStart={(info) => console.info('onGameStart', info)}
          onGameEnd={(result) => console.info('onGameEnd', result)}
        />
      </main>
    </>
  );
}

const container = document.getElementById('root');
if (!container) {
  throw new Error('Missing #root element');
}
createRoot(container).render(
  <StrictMode>
    <Playground />
  </StrictMode>,
);
