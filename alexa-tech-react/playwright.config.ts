import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  // Start backend API and frontend dev server for E2E
  webServer: [
    {
      command: 'npm run dev --prefix ../alexa-tech-backend',
      url: 'http://localhost:3001/api/health',
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: 'npm run dev -- --mode e2e',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 120_000,
      // Ensure permissions are enforced during E2E by disabling bypass
      env: {
        VITE_BYPASS_AUTH: 'false',
        VITE_API_URL: 'http://localhost:3001/api',
      },
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});