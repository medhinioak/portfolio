/** Playground: renders the game package without the site. */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { clamp } from '../src/index';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Missing #root element');
}

createRoot(container).render(
  <StrictMode>
    <main>
      <h1>Game playground</h1>
      <p>clamp(42, 0, 10) = {clamp(42, 0, 10)}</p>
    </main>
  </StrictMode>,
);
