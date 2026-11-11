/** Astro config: static output with React islands (ADR-0001), self-hosted fonts (ADR-0004). */
import { defineConfig, fontProviders } from 'astro/config';
import react from '@astrojs/react';

// Fonts are the Latin .woff2 files from the @fontsource packages in node_modules,
// served from this site. The build needs no network. See docs/design/tokens.md.
const fontFile = (pkg, file) => `@fontsource/${pkg}/files/${file}.woff2`;
const atkinson = (weight, style) => ({
  weight,
  style,
  src: [
    fontFile(
      'atkinson-hyperlegible',
      `atkinson-hyperlegible-latin-${weight}-${style}`,
    ),
  ],
});

export default defineConfig({
  site: 'https://medhinioak.dev',
  output: 'static',
  integrations: [react()],
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Pixelify Sans',
      cssVariable: '--font-pixel',
      display: 'swap',
      fallbacks: ['sans-serif'],
      options: {
        variants: [
          {
            weight: 400,
            style: 'normal',
            src: [fontFile('pixelify-sans', 'pixelify-sans-latin-400-normal')],
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Atkinson Hyperlegible',
      cssVariable: '--font-body',
      display: 'swap',
      fallbacks: ['sans-serif'],
      options: {
        variants: [
          atkinson(400, 'normal'),
          atkinson(700, 'normal'),
          atkinson(400, 'italic'),
        ],
      },
    },
  ],
});
