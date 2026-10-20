import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  outputDir: '/tmp/browser/cinetrack-e2e-results',
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'off',
    screenshot: 'off',
    video: 'off',
    viewport: { width: 1280, height: 1800 },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 1800 } } }],
});