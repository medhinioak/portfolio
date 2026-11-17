/** Root Vitest config: runs every package's tests from the repository root. */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['packages/game', 'apps/site'],
    // Used by `pnpm test:coverage`: the engine targets about 80 % (CLAUDE.md).
    coverage: {
      include: ['packages/game/src/engine/**/*.ts'],
      thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
    },
  },
});
