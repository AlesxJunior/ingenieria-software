import { defineConfig, devices } from '@playwright/test';

// Usar backend real solo si CI_BACKEND=true; si no, usar servidor falso de salud
const useRealBackend = process.env.CI_BACKEND === 'true';
const backendCommand = useRealBackend ? 'npm run dev --prefix ../alexa-tech-backend' : 'node ../fake-backend-health.js';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  // Start backend API and frontend dev server for E2E
  webServer: [
    {
      command: backendCommand,
      url: 'http://localhost:3001/api/health',
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: 'npm run build && npm run preview',
      url: 'http://localhost:4173',
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});