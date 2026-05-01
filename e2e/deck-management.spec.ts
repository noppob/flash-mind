import { test, expect } from "@playwright/test"
import { login, SEED_HOME_DECK_NAME, seedDb } from "./helpers"

test.describe("deck management", () => {
  test.beforeAll(seedDb)
  test.afterAll(seedDb)

  test("can add a new card to a deck and see it in the list", async ({
    page,
  }) => {
    await login(page)
    await page.getByText(SEED_HOME_DECK_NAME).click()

    // Wait for the deck detail header to show.
    await expect(
      page.getByRole("button", { name: "フラッシュカード" }),
    ).toBeVisible({ timeout: 10_000 })

    // Open the new-card editor.
    await page.getByRole("button", { name: "カード追加" }).click()
    await expect(page.getByRole("heading", { name: "カード追加" })).toBeVisible({
      timeout: 10_000,
    })

    // Fill in word + meaning. Use a unique suffix so re-runs (if SKIP_SEED is
    // set) don't collide on the same word repeatedly. globalSetup wipes seed
    // anyway so collisions shouldn't happen on a fresh run.
    const unique = `e2eword${Date.now()}`
    const word = page.locator("input[type='text']").first()
    await word.fill(unique)
    const meaning = page.locator("textarea").first()
    await meaning.fill("e2eテスト用カード")

    // Save (footer "カードを保存" button — exact text avoids matching the
    // header "保存" button which uses the same suffix).
    await page.getByRole("button", { name: "カードを保存" }).click()

    // We should land back on deck-detail. The deck-detail preview only shows
    // up to 8 cards, so go through the full card list and search for the new
    // word — the existence of a search hit confirms the create succeeded.
    await page.getByRole("button", { name: "一覧表示" }).click()
    await expect(page.getByPlaceholder("検索...")).toBeVisible({
      timeout: 10_000,
    })
    await page.getByPlaceholder("検索...").fill(unique)
    await expect(page.getByText(unique)).toBeVisible({ timeout: 15_000 })
  })

  test("opens the card list view from a deck", async ({ page }) => {
    await login(page)
    await page.getByText(SEED_HOME_DECK_NAME).click()
    await expect(
      page.getByRole("button", { name: "一覧表示" }),
    ).toBeVisible({ timeout: 10_000 })

    await page.getByRole("button", { name: "一覧表示" }).click()
    // CardListScreen renders a "戻る" header and the deck word list.
    await expect(page.getByPlaceholder("検索...")).toBeVisible({
      timeout: 10_000,
    })
  })

  test("editing an existing card persists the change", async ({ page }) => {
    await login(page)
    await page.getByText(SEED_HOME_DECK_NAME).click()
    await expect(
      page.getByRole("button", { name: "フラッシュカード" }),
    ).toBeVisible({ timeout: 10_000 })

    // Click the first card preview row in the deck-detail list.
    // The cards are rendered as buttons whose text starts with the word.
    const firstCard = page.locator("button").filter({ has: page.locator("p.font-medium") }).first()
    await firstCard.click()

    await expect(page.getByRole("heading", { name: "カード編集" })).toBeVisible({
      timeout: 10_000,
    })

    // Append a marker to the meaning textarea (don't clear — preserve seed
    // assertions in other tests).
    const meaning = page.locator("textarea").first()
    const original = (await meaning.inputValue()) || ""
    const marker = " /e2e/"
    await meaning.fill(original + marker)
    await page.getByRole("button", { name: "カードを保存" }).click()

    // Returning to deck-detail; the appended marker eventually appears in the
    // preview meaning text.
    await expect(page.getByText(new RegExp(marker.trim()))).toBeVisible({
      timeout: 15_000,
    })
  })
})
