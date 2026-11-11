/** Root Vitest config: runs every package's tests from the repository root. */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['packages/game'],
  },
});
