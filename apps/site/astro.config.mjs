/** Astro config: static output with React islands (ADR-0001). */
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://medhinioak.dev',
  output: 'static',
  integrations: [react()],
});
