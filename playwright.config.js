import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  // Using multiple workers is safe because Playwright natively isolates localStorage per test context
  workers: process.env.CI ? 2 : undefined,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    browserName: 'chromium'
  },
  webServer: {
    // Automatically boot frontend in Demo Mode securely for tests
    command: 'VITE_DEMO_MODE=true npm run dev:frontend',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 10000,
  },
});
