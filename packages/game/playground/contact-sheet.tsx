/// <reference types="vite/client" />
/** Contact sheet page: every animal sprite in light and dark (`/contact-sheet.html` in the game dev server). */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { animalsBoard } from '../src/index';
import './contact-sheet.css';

const files = import.meta.glob<string>('../src/boards/animals/sprites/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
});

/** Returns the SVG markup for a sprite name, or undefined while it is still missing. */
function spriteSvg(name: string): string | undefined {
  return files[`../src/boards/animals/sprites/${name}.svg`];
}

/** One sprite drawn inline, so its outline takes the colour of the panel. */
function Sprite(props: {
  svg: string;
  alt: string;
  size: number;
  blurred?: boolean;
}): React.JSX.Element {
  return (
    <span
      className={props.blurred ? 'sprite blurred' : 'sprite'}
      role="img"
      aria-label={props.alt}
      style={{ width: props.size, height: props.size }}
      dangerouslySetInnerHTML={{ __html: props.svg }}
    />
  );
}

/** One theme's panel: every animal at 64 px, 32 px and 64 px blurred (the ruled-out look). */
function Panel(props: { theme: 'light' | 'dark' }): React.JSX.Element {
  return (
    <section className={`panel ${props.theme}`}>
      <h2>{props.theme === 'light' ? 'Light' : 'Dark'}</h2>
      <div className="cards">
        {animalsBoard.characters.map((character) => {
          const svg = spriteSvg(character.sprite);
          return (
            <div className="card" key={character.id}>
              {svg ? (
                <div className="sizes">
                  <Sprite svg={svg} alt={character.alt} size={64} />
                  <Sprite svg={svg} alt="" size={32} />
                  <Sprite svg={svg} alt="" size={64} blurred />
                </div>
              ) : (
                <div className="missing">no sprite yet</div>
              )}
              <span>{character.name}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const container = document.getElementById('root');
if (!container) {
  throw new Error('Missing #root element');
}

createRoot(container).render(
  <StrictMode>
    <main>
      <h1>Sprite contact sheet</h1>
      <p className="note">
        Each animal at 64 px (the board), 32 px (the computer&apos;s board) and
        blurred 2 px (ruled out), in both themes.
      </p>
      <div className="panels">
        <Panel theme="light" />
        <Panel theme="dark" />
      </div>
    </main>
  </StrictMode>,
);
