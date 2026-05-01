import { test, expect } from "@playwright/test"
import {
  login,
  gotoTab,
  mockAi,
  mockImportYoutube,
  seedDb,
} from "./helpers"

test.describe("import flow (mocked AI + imports)", () => {
  test.beforeAll(seedDb)
  test.afterAll(seedDb)

  test("YouTube: URL → transcript → word lookup → register to deck", async ({
    page,
  }) => {
    // Mocks must be installed before navigation so the very first request is
    // intercepted. We set them up on the page object.
    await mockAi(page)
    await mockImportYoutube(page)

    await login(page)
    await gotoTab(page, "取込")
    await expect(page.getByText("コンテンツ取込")).toBeVisible()

    // Pick the YouTube source.
    await page.getByText("YouTube").click()
    await expect(page.getByPlaceholder("YouTube URL を貼り付け")).toBeVisible()

    await page
      .getByPlaceholder("YouTube URL を貼り付け")
      .fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ")

    // Kick off the import. Mock returns running once → then done.
    await page.getByRole("button", { name: /書き起こしを取得/ }).click()

    // Transcript view appears once the polling loop sees status=done.
    await expect(
      page.getByText("Hello world this is a test transcript."),
    ).toBeVisible({ timeout: 15_000 })

    // Tap a word to open the in-line popover. Each word is wrapped in its
    // own span — pick the bare "Hello" span by exact match so we don't hit
    // the parent paragraph.
    await page.getByText("Hello", { exact: true }).click()

    // Popover shows two buttons: 登録 and 辞書.
    await expect(page.getByRole("button", { name: /^登録/ })).toBeVisible({
      timeout: 5_000,
    })

    // Use the dictionary lookup; the AI mock returns __MOCK__:<word>.
    // The exact word casing depends on what the renderer extracts from the
    // span — match the prefix so we don't get tripped up.
    await page.getByRole("button", { name: "辞書" }).click()
    await expect(page.getByText(/__MOCK__/)).toBeVisible({ timeout: 10_000 })

    // Now register the word.
    await page.getByRole("button", { name: /^登録/ }).click()
    await expect(page.getByText(/1\s*語 選択済み/)).toBeVisible()

    // Open the deck picker bottom sheet and pick the first seeded deck.
    await page.getByRole("button", { name: /デッキに登録/ }).click()
    await expect(
      page.getByRole("heading", { name: "登録先デッキを選択" }),
    ).toBeVisible({ timeout: 10_000 })

    // Pick "TOEIC 頻出 800語" — it's part of the seed.
    await page.getByText("TOEIC 頻出 800語").last().click()

    // Success banner shows after createCards resolves against the real DB.
    await expect(page.getByText(/枚を「.*」に追加しました/)).toBeVisible({
      timeout: 15_000,
    })
  })

  test("YouTube: empty URL surfaces an inline validation message", async ({
    page,
  }) => {
    await mockAi(page)
    await mockImportYoutube(page)

    await login(page)
    await gotoTab(page, "取込")
    await page.getByText("YouTube").click()

    // Without entering a URL, click the analyze button — the screen should
    // show a validation message rather than firing the API.
    await page.getByRole("button", { name: /書き起こしを取得/ }).click()
    await expect(page.getByText("YouTube URL を入力してください")).toBeVisible({
      timeout: 5_000,
    })
  })
})
