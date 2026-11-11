/** Vite config for the standalone game playground and its tests. */
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'playground',
  plugins: [react()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  test: {
    root: '.',
    include: ['src/**/*.test.ts'],
  },
});
