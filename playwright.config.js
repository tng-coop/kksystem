import { defineConfig } from '@playwright/test';

const targetUrl = process.env.TEST_URL || 'http://localhost:5173';
const isRemoteUrl = !!process.env.TEST_URL;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  // Using multiple workers is safe because Playwright natively isolates localStorage per test context
  workers: process.env.CI ? 2 : undefined,
  retries: 0,
  use: {
    baseURL: targetUrl,
    trace: 'on-first-retry',
    browserName: 'chromium'
  },
  webServer: isRemoteUrl ? undefined : {
    // Automatically boot frontend in Demo Mode securely for tests
    command: 'VITE_DEMO_MODE=true npm run dev:frontend',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 10000,
  },
});
