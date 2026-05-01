import { test, expect } from "@playwright/test"
import { login, gotoTab } from "./helpers"

test.describe("stats screen", () => {
  test("renders all three top-line metrics", async ({ page }) => {
    await login(page)
    await gotoTab(page, "統計")

    await expect(page.getByRole("heading", { name: "統計" })).toBeVisible({
      timeout: 10_000,
    })
    await expect(page.getByText("連続日数")).toBeVisible()
    // "今週の学習" is also a substring of the chart heading "今週の学習量" —
    // use exact: true to disambiguate.
    await expect(page.getByText("今週の学習", { exact: true })).toBeVisible()
    await expect(page.getByText("平均正答率")).toBeVisible()
  })

  test("renders the weekly chart and the deck-mastery section", async ({
    page,
  }) => {
    await login(page)
    await gotoTab(page, "統計")
    await expect(
      page.getByRole("heading", { name: "今週の学習量" }),
    ).toBeVisible({ timeout: 10_000 })
    await expect(
      page.getByRole("heading", { name: "デッキ別習得率" }),
    ).toBeVisible()
  })

  test("renders the weak-cards top-5 section", async ({ page }) => {
    await login(page)
    await gotoTab(page, "統計")
    // The heading contains the flag icon + "苦手カード TOP 5". Use a regex
    // because lucide-react inserts an svg in between.
    await expect(page.getByRole("heading", { name: /苦手カード TOP 5/ })).toBeVisible(
      { timeout: 10_000 },
    )
  })
})
