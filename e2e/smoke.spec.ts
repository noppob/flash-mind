import { test, expect } from "@playwright/test"
import { login, gotoTab, SEED_EMAIL, SEED_HOME_DECK_NAME } from "./helpers"

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

    await gotoTab(page, "探す")
    await expect(page.getByText("TOEIC 900点突破 必須単語")).toBeVisible({
      timeout: 10_000,
    })

    await gotoTab(page, "取込")
    await expect(page.getByText("コンテンツ取込")).toBeVisible()

    await gotoTab(page, "統計")
    await expect(page.getByRole("heading", { name: "統計" })).toBeVisible({
      timeout: 10_000,
    })
    await expect(page.getByText("連続日数")).toBeVisible()

    await gotoTab(page, "設定")
    await expect(page.getByText(SEED_EMAIL)).toBeVisible({ timeout: 10_000 })

    await gotoTab(page, "ホーム")
    await expect(page.getByText(SEED_HOME_DECK_NAME)).toBeVisible()
  })

  test("opening a deck shows its action buttons", async ({ page }) => {
    await login(page)
    await page.getByText(SEED_HOME_DECK_NAME).click()
    await expect(
      page.getByRole("button", { name: "フラッシュカード" }),
    ).toBeVisible({ timeout: 10_000 })
    await expect(
      page.getByRole("button", { name: "4択クイズ" }),
    ).toBeVisible()
  })

  test("flashcard screen renders TTS button", async ({ page }) => {
    await login(page)
    await page.getByText(SEED_HOME_DECK_NAME).click()
    await page.getByRole("button", { name: "フラッシュカード" }).click()
    await expect(
      page.getByRole("button", { name: "Pronounce word" }),
    ).toBeVisible({ timeout: 15_000 })
  })

  test("import screen shows source picker", async ({ page }) => {
    await login(page)
    await gotoTab(page, "取込")
    await expect(page.getByText("PDF")).toBeVisible()
    await expect(page.getByText("Podcast")).toBeVisible()
    await expect(page.getByText("YouTube")).toBeVisible()
  })

  test("explore tab lists public decks (Phase 2 hydrate)", async ({ page }) => {
    await login(page)
    await gotoTab(page, "探す")
    await expect(page.getByText("TOEIC 900点突破 必須単語")).toBeVisible({
      timeout: 10_000,
    })
    await expect(page.getByText("英検1級 語彙完全攻略")).toBeVisible()
  })
})
