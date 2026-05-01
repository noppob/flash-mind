import { test, expect, type Page } from "@playwright/test"

const SEED_EMAIL = "tanaka@email.com"
const SEED_PASSWORD = "password123"

// The login form's email/password fields ship with the seed credentials
// pre-filled, so we just need to submit and wait for the post-login reload.
async function login(page: Page) {
  await page.goto("/")
  // The login form sets value via React state, but in case it wasn't pre-filled
  // (e.g. browser auto-cleared), set the values explicitly.
  await page.getByPlaceholder("メールアドレス").fill(SEED_EMAIL)
  await page.getByPlaceholder("パスワード").fill(SEED_PASSWORD)
  await page.getByRole("button", { name: "ログイン" }).click()
  // Login does window.location.reload() after success — wait for the home
  // header to confirm we landed in the authenticated tree.
  await expect(page.getByText("TOEIC 頻出 800語")).toBeVisible({ timeout: 15_000 })
}

test.describe("smoke", () => {
  test("login lands on home with seeded decks", async ({ page }) => {
    await login(page)
    // Multiple seeded decks should be visible.
    await expect(page.getByText("英検準1級")).toBeVisible()
    await expect(page.getByText("経済用語 基礎")).toBeVisible()
    await expect(page.getByText("IT用語辞典")).toBeVisible()
  })

  test("bottom tabs navigate between sections", async ({ page }) => {
    await login(page)

    // 探す (Explore)
    await page.getByRole("button", { name: /探す/ }).click()
    await expect(page.getByText("TOEIC 900点突破 必須単語")).toBeVisible({
      timeout: 10_000,
    })

    // 取込 (Import)
    await page.getByRole("button", { name: /取込/ }).click()
    await expect(page.getByText("コンテンツ取込")).toBeVisible()

    // 統計 (Stats)
    await page.getByRole("button", { name: /統計/ }).click()
    await expect(page.getByRole("heading", { name: "統計" })).toBeVisible({
      timeout: 10_000,
    })
    await expect(page.getByText("連続日数")).toBeVisible()

    // 設定 (Settings)
    await page.getByRole("button", { name: /設定/ }).click()
    await expect(page.getByText(SEED_EMAIL)).toBeVisible({ timeout: 10_000 })

    // ホーム
    await page.getByRole("button", { name: /ホーム/ }).click()
    await expect(page.getByText("TOEIC 頻出 800語")).toBeVisible()
  })

  test("opening a deck shows its action buttons", async ({ page }) => {
    await login(page)
    await page.getByText("TOEIC 頻出 800語").click()
    await expect(
      page.getByRole("button", { name: "フラッシュカード" }),
    ).toBeVisible({ timeout: 10_000 })
    await expect(
      page.getByRole("button", { name: "4択クイズ" }),
    ).toBeVisible()
  })

  test("flashcard screen renders TTS button", async ({ page }) => {
    await login(page)
    await page.getByText("TOEIC 頻出 800語").click()
    await page
      .getByRole("button", { name: "フラッシュカード" })
      .click()
    // The Volume2 icon is rendered as a <button aria-label="Pronounce word">.
    await expect(
      page.getByRole("button", { name: "Pronounce word" }),
    ).toBeVisible({ timeout: 15_000 })
  })

  test("import screen shows source picker", async ({ page }) => {
    await login(page)
    await page.getByRole("button", { name: /取込/ }).click()
    await expect(page.getByText("PDF")).toBeVisible()
    await expect(page.getByText("Podcast")).toBeVisible()
    await expect(page.getByText("YouTube")).toBeVisible()
  })

  test("explore tab lists public decks (Phase 2 hydrate)", async ({ page }) => {
    await login(page)
    await page.getByRole("button", { name: /探す/ }).click()
    await expect(page.getByText("TOEIC 900点突破 必須単語")).toBeVisible({
      timeout: 10_000,
    })
    await expect(page.getByText("英検1級 語彙完全攻略")).toBeVisible()
  })
})
