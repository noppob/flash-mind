import { describe, it, expect } from "vitest"
import { ImportUrlSchema } from "./import"

describe("ImportUrlSchema", () => {
  it("accepts a valid YouTube URL", () => {
    expect(
      ImportUrlSchema.safeParse({
        type: "youtube",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      }).success,
    ).toBe(true)
  })

  it("accepts a valid podcast URL", () => {
    expect(
      ImportUrlSchema.safeParse({
        type: "podcast",
        url: "https://example.com/audio.mp3",
      }).success,
    ).toBe(true)
  })

  it("rejects unknown type", () => {
    expect(
      ImportUrlSchema.safeParse({
        type: "pdf",
        url: "https://example.com/file.pdf",
      }).success,
    ).toBe(false)
  })

  it("rejects malformed URL", () => {
    expect(
      ImportUrlSchema.safeParse({ type: "youtube", url: "not a url" }).success,
    ).toBe(false)
  })

  it("rejects URL longer than 2000 chars", () => {
    const long = `https://example.com/?q=${"x".repeat(2000)}`
    expect(ImportUrlSchema.safeParse({ type: "youtube", url: long }).success).toBe(
      false,
    )
  })
})
