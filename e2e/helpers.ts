import { execSync } from "node:child_process"
import { expect, type Page } from "@playwright/test"

export const SEED_EMAIL = "tanaka@email.com"
export const SEED_PASSWORD = "password123"

// First seeded deck name — used as a "we are authenticated and on home" beacon.
export const SEED_HOME_DECK_NAME = "TOEIC 頻出 800語"

export type TabName = "ホーム" | "探す" | "取込" | "統計" | "設定"

// Re-run prisma seed. Use this from `test.beforeAll` in any spec that mutates
// state (creates cards, submits reviews, registers imported words, toggles
// settings) so the next spec starts from the same baseline. The runtime cost
// is ~1 second on SQLite.
export function seedDb() {
  execSync("pnpm db:seed", { stdio: "inherit" })
}

export async function login(page: Page) {
  await page.goto("/")
  // Login form pre-fills these from the seed user, but set them explicitly in
  // case the browser cleared autofill.
  await page.getByPlaceholder("メールアドレス").fill(SEED_EMAIL)
  await page.getByPlaceholder("パスワード").fill(SEED_PASSWORD)
  await page.getByRole("button", { name: "ログイン" }).click()
  // Login does window.location.reload() — wait for the home header to confirm.
  await expect(page.getByText(SEED_HOME_DECK_NAME)).toBeVisible({ timeout: 15_000 })
}

export async function gotoTab(page: Page, name: TabName) {
  await page.getByRole("button", { name: new RegExp(name) }).click()
}

export async function logout(page: Page) {
  await gotoTab(page, "設定")
  await page.getByRole("button", { name: /ログアウト/ }).click()
  // Login screen returns — assert by the password placeholder.
  await expect(page.getByPlaceholder("パスワード")).toBeVisible({ timeout: 10_000 })
}

// ---------------------------------------------------------------------------
// API mocks (Phase 3) — only OpenAI / imports surface is mocked. Everything
// else (decks/cards/reviews) is exercised end-to-end against the real DB.
// ---------------------------------------------------------------------------

export async function mockAi(page: Page) {
  await page.route("**/api/ai/lookup", async (route) => {
    let word = "unknown"
    try {
      const body = route.request().postDataJSON() as { word?: string }
      word = body?.word ?? "unknown"
    } catch {
      /* fall back */
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        word,
        meaning: `__MOCK__:${word}`,
        pronunciation: null,
        pos: "n",
        example: `Example for ${word}.`,
        exampleJa: `${word} の例文。`,
      }),
    })
  })
  await page.route("**/api/ai/generate", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ content: "モック生成テキスト" }),
    })
  })
}

export type MockTranscriptLine = { time: number; en: string; ja: string }

const DEFAULT_TRANSCRIPT: MockTranscriptLine[] = [
  {
    time: 0,
    en: "Hello world this is a test transcript.",
    ja: "こんにちは、これはテスト用のトランスクリプトです。",
  },
  {
    time: 10,
    en: "Second line containing another vocabulary item.",
    ja: "2行目には別の語彙項目が含まれています。",
  },
]

export async function mockImportYoutube(
  page: Page,
  transcript: MockTranscriptLine[] = DEFAULT_TRANSCRIPT,
) {
  const jobId = "mock-yt-job"
  await page.route("**/api/imports", async (route, request) => {
    if (request.method() !== "POST") {
      await route.fallback()
      return
    }
    await route.fulfill({
      status: 202,
      contentType: "application/json",
      body: JSON.stringify({ jobId }),
    })
  })

  let polls = 0
  await page.route(`**/api/imports/${jobId}`, async (route) => {
    polls += 1
    const body =
      polls < 2
        ? {
            jobId,
            status: "running" as const,
            progress: 50,
            currentStep: "translating" as const,
          }
        : {
            jobId,
            status: "done" as const,
            progress: 100,
            currentStep: null,
            result: {
              id: "mock-yt-result",
              sourceType: "youtube" as const,
              title: "Mock YouTube Video",
              durationSeconds: 30,
              transcript,
            },
          }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(body),
    })
  })
}
