import { test, expect } from "@playwright/test"
import { login, logout, SEED_EMAIL, SEED_HOME_DECK_NAME } from "./helpers"

test.describe("auth", () => {
  test("invalid password shows error and stays on login", async ({ page }) => {
    await page.goto("/")
    await page.getByPlaceholder("メールアドレス").fill(SEED_EMAIL)
    await page.getByPlaceholder("パスワード").fill("wrong-password-123")
    await page.getByRole("button", { name: "ログイン" }).click()

    await expect(
      page.getByText("メールまたはパスワードが正しくありません"),
    ).toBeVisible({ timeout: 10_000 })
    // Login form is still on screen.
    await expect(page.getByPlaceholder("パスワード")).toBeVisible()
  })

  test("login then logout returns to login screen", async ({ page }) => {
    await login(page)
    await logout(page)
    // After logout the login form is visible again.
    await expect(page.getByPlaceholder("メールアドレス")).toBeVisible()
    // The seeded home deck is no longer rendered.
    await expect(page.getByText(SEED_HOME_DECK_NAME)).toHaveCount(0)
  })

  test("toggling between login and signup modes", async ({ page }) => {
    await page.goto("/")
    await expect(
      page.getByText("アカウントをお持ちでない方は サインアップ"),
    ).toBeVisible()

    await page.getByText("アカウントをお持ちでない方は サインアップ").click()
    // Display-name input only appears in signup mode.
    await expect(page.getByPlaceholder("表示名（任意）")).toBeVisible()
    await expect(
      page.getByText("すでにアカウントをお持ちの方は ログイン"),
    ).toBeVisible()

    // Toggle back.
    await page.getByText("すでにアカウントをお持ちの方は ログイン").click()
    await expect(page.getByPlaceholder("表示名（任意）")).toHaveCount(0)
  })
})
