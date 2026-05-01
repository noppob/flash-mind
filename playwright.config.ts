import { defineConfig, devices } from "@playwright/test"

const PORT = Number(process.env.PORT ?? 3000)
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false, // a single Next.js dev server backs every test
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1, // shared dev server + Postgres connection pool → keep serial
  reporter: process.env.CI ? "github" : [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    viewport: { width: 414, height: 896 }, // iPhone 11-ish; matches IPhoneShell
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 414, height: 896 } },
    },
  ],
  // Reuse the dev server if it's already running (e.g. during local dev), else
  // boot one. The seeded test user lives in the configured DB (Neon dev branch
  // by default; SQLite when DATABASE_URL=file:./dev.db).
  webServer: {
    command: "pnpm dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    stdout: "pipe",
    stderr: "pipe",
  },
})
