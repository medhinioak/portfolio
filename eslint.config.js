/** ESLint flat config for the whole workspace. */
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

// ADR-0002: the game never imports from the site.
const siteImports = {
  group: ['site', 'site/*', '**/apps/site/**'],
  message: 'packages/game must not import from apps/site (ADR-0002).',
};

// ADR-0002: the engine imports no React.
const reactImports = {
  group: ['react', 'react/*', 'react-dom', 'react-dom/*'],
  message: 'packages/game/src/engine must not import React (ADR-0002).',
};

export default tseslint.config(
  { ignores: ['**/dist/', '**/.astro/', 'coverage/'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  astro.configs.recommended,
  {
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'error',
    },
  },
  {
    files: ['packages/game/**'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [siteImports] }],
    },
  },
  {
    // A later block replaces the rule for these files, so repeat siteImports.
    files: ['packages/game/src/engine/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [siteImports, reactImports] },
      ],
    },
  },
);
