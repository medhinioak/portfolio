/** Playwright config: smoke, axe and drawer tests against the built site (issue #12). */
import { defineConfig, devices } from '@playwright/test';

// A port the Astro dev server (4321) and other local servers don't use.
const port = 4310;
const ci = Boolean(process.env.CI);

export default defineConfig({
  testDir: 'e2e',
  forbidOnly: ci,
  retries: ci ? 1 : 0,
  reporter: ci ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Serves the existing build: run `pnpm build` first.
  webServer: {
    command: `ASTRO_TELEMETRY_DISABLED=1 astro preview --host 127.0.0.1 --port ${port}`,
    url: `http://127.0.0.1:${port}/`,
    reuseExistingServer: !ci,
  },
});
