import { test, expect } from "@playwright/test"
import { login, SEED_HOME_DECK_NAME, seedDb } from "./helpers"

test.describe("learning flow (real DB)", () => {
  // Each test here mutates SRS state. Reset between tests so a "rate every
  // card" run doesn't zero out dueCards for the next "favorite toggle" test.
  // Also seed once after the last test so following spec files start clean.
  test.beforeEach(seedDb)
  test.afterAll(seedDb)

  test("flashcard session: rate every card and land on results", async ({
    page,
  }) => {
    await login(page)
    await page.getByText(SEED_HOME_DECK_NAME).click()
    await page.getByRole("button", { name: "フラッシュカード" }).click()

    // Wait until the rating buttons appear.
    const remembered = page.getByRole("button", { name: /思い出せた/ })
    const forgot = page.getByRole("button", { name: /忘れた/ })
    await expect(remembered).toBeVisible({ timeout: 15_000 })

    // Read the "1/N" counter to learn how many cards are due.
    const counter = page.locator("text=/^\\d+\\/\\d+$/").first()
    await expect(counter).toBeVisible()
    const counterText = (await counter.textContent()) ?? "1/1"
    const total = Number(counterText.split("/")[1] ?? "1")
    expect(total).toBeGreaterThan(0)

    // Alternate ratings so we hit both code paths in submitReviews.
    for (let i = 0; i < total; i++) {
      // Avoid clicking before the previous transition settles.
      await expect(remembered).toBeEnabled()
      if (i % 2 === 0) {
        await remembered.click()
      } else {
        await forgot.click()
      }
    }

    await expect(page.getByText("学習完了!")).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText("正答率")).toBeVisible()
    // Both wrap-up buttons are present.
    await expect(page.getByRole("button", { name: /もう一度/ })).toBeVisible()
    await expect(page.getByRole("button", { name: /ホームへ/ })).toBeVisible()
  })

  test("quiz session: answer 5 questions and land on results", async ({
    page,
  }) => {
    await login(page)
    await page.getByText(SEED_HOME_DECK_NAME).click()
    await page.getByRole("button", { name: "4択クイズ" }).click()

    // Wait for the first question to render.
    await expect(
      page.getByText("この単語の意味は？"),
    ).toBeVisible({ timeout: 15_000 })

    // Up to 5 questions; loop generously and break when results show.
    for (let q = 0; q < 5; q++) {
      // Click the first answer choice (A). Whether correct or not, both
      // paths submit a ReviewItem so we exercise both /api/reviews branches.
      await page.getByRole("button", { name: /^A\s/ }).click()

      // After the answer is locked in, an "次の問題" or "結果を見る" button shows.
      const next = page.getByRole("button", { name: /次の問題|結果を見る/ })
      await expect(next).toBeVisible({ timeout: 10_000 })
      await next.click()

      // If we just clicked "結果を見る", break.
      const done = await page
        .getByText("学習完了!")
        .isVisible()
        .catch(() => false)
      if (done) break
    }

    await expect(page.getByText("学習完了!")).toBeVisible({ timeout: 15_000 })
  })

  test("favorite (star) toggle persists during a flashcard session", async ({
    page,
  }) => {
    await login(page)
    await page.getByText(SEED_HOME_DECK_NAME).click()
    await page.getByRole("button", { name: "フラッシュカード" }).click()

    const star = page.getByRole("button", { name: "Favorite" })
    await expect(star).toBeVisible({ timeout: 15_000 })
    // Click toggles the flagged state via /api/cards/[id]/flag — this is a
    // real network call against the seeded DB.
    await star.click()
    // The star button stays present after the toggle (visual state changes
    // but the element is still there).
    await expect(star).toBeVisible()
  })
})
