/** Vitest config for the site's plain TypeScript helpers (no Astro plugin needed). */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
