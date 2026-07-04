import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'iPhone SE',
      use: { 
        ...devices['iPhone SE'],
      },
    },
    {
      name: 'iPhone 14 Pro',
      use: { 
        ...devices['iPhone 14 Pro'],
      },
    },
    {
      name: 'Pixel 7',
      use: { 
        ...devices['Pixel 7'],
      },
    },
    {
      name: 'Tablet',
      use: { 
        ...devices['iPad Mini'],
        viewport: { width: 768, height: 1024 }
      },
    },
    {
      name: 'Desktop',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
    },
  ],
});
