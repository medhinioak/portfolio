/** Playwright config: keyboard, axe and phone tests against the built playground (issue #76). */
import { defineConfig, devices } from '@playwright/test';

// Not 4310 (the site's e2e server) or 5173 (Vite dev), so both suites can run side by side.
const port = 4311;
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
  // Serves the playground build; `pnpm --filter game test:e2e` builds it first.
  webServer: {
    command: `vite preview --host 127.0.0.1 --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}/`,
    reuseExistingServer: !ci,
  },
});
