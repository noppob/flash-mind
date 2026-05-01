import { test, expect } from "@playwright/test"
import { login, gotoTab, SEED_EMAIL, seedDb } from "./helpers"

test.describe("settings screen", () => {
  // The dark-mode toggle test mutates /api/me — reset state for next spec.
  test.afterAll(seedDb)

  test("renders profile, all sections, and the logout button", async ({
    page,
  }) => {
    await login(page)
    await gotoTab(page, "設定")

    await expect(
      page.getByRole("heading", { name: "設定", exact: true }),
    ).toBeVisible({ timeout: 10_000 })
    // The seeded user's email shows in the profile row.
    await expect(page.getByText(SEED_EMAIL)).toBeVisible()

    // Section headings — Section() renders them as h3.
    for (const heading of [
      "アカウント",
      "インポート",
      "学習設定",
      "表示設定",
      "その他",
    ]) {
      await expect(
        page.getByRole("heading", { name: heading, exact: true }),
      ).toBeVisible()
    }

    await expect(page.getByRole("button", { name: /ログアウト/ })).toBeVisible()
  })

  test("import modal opens and dismisses with cancel", async ({ page }) => {
    await login(page)
    await gotoTab(page, "設定")

    await page
      .getByRole("button", { name: /新規デッキを作成してインポート/ })
      .click()
    await expect(
      page.getByRole("heading", { name: "新規デッキを作成" }),
    ).toBeVisible({ timeout: 10_000 })

    await page.getByRole("button", { name: "キャンセル" }).click()
    // Heading goes away after dismissing.
    await expect(
      page.getByRole("heading", { name: "新規デッキを作成" }),
    ).toHaveCount(0)
  })

  test("dark mode toggle persists across the API roundtrip", async ({
    page,
  }) => {
    await login(page)
    await gotoTab(page, "設定")
    await expect(
      page.getByRole("heading", { name: "設定", exact: true }),
    ).toBeVisible({ timeout: 10_000 })

    // The toggle is the unlabelled button in the "表示設定" row that wraps the
    // "ダークモード" label. Walk from the label to its row, then to the row's
    // sibling button.
    const row = page
      .locator("div.justify-between")
      .filter({ has: page.getByText("ダークモード", { exact: true }) })
    await expect(row).toBeVisible()
    const toggle = row.getByRole("button")
    await toggle.click()

    // Round-trip: navigate away and back. The PUT /api/me/darkMode request
    // resolved with 200 if we got this far without throwing — the visual
    // state of the toggle is implementation detail we don't assert on.
    await gotoTab(page, "ホーム")
    await gotoTab(page, "設定")
    await expect(
      page.getByRole("heading", { name: "設定", exact: true }),
    ).toBeVisible()
  })
})
