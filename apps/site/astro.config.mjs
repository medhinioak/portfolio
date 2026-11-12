/** Astro config: static output with React islands (ADR-0001), self-hosted fonts (ADR-0004). */
import { defineConfig, fontProviders } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import react from '@astrojs/react';
import { rehypeFigure } from './src/lib/rehype-figure.ts';
import { rehypeScrollableCode } from './src/lib/rehype-scrollable-code.ts';

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
  markdown: {
    // A Markdown image with a title on its own line becomes a captioned figure;
    // code blocks get tabindex="0" so they scroll with the keyboard.
    processor: unified({ rehypePlugins: [rehypeFigure, rehypeScrollableCode] }),
    // Shiki writes colours inline, which the token rule forbids (ADR-0010).
    syntaxHighlight: false,
  },
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
