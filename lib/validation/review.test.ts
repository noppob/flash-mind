import { describe, it, expect } from "vitest"
import { ReviewSubmissionSchema } from "./review"

const item = (over: Partial<{ rating: number; mode: string; cardId: string; correct: boolean }> = {}) => ({
  cardId: "c1",
  mode: "flashcard",
  rating: 5,
  correct: true,
  ...over,
})

describe("ReviewSubmissionSchema", () => {
  it("accepts a typical submission", () => {
    expect(
      ReviewSubmissionSchema.safeParse({ items: [item()] }).success,
    ).toBe(true)
  })

  it("rejects empty items array", () => {
    expect(ReviewSubmissionSchema.safeParse({ items: [] }).success).toBe(false)
  })

  it("rejects more than 200 items", () => {
    expect(
      ReviewSubmissionSchema.safeParse({
        items: Array(201).fill(item()),
      }).success,
    ).toBe(false)
  })

  it("accepts exactly 200 items", () => {
    expect(
      ReviewSubmissionSchema.safeParse({
        items: Array(200).fill(item()),
      }).success,
    ).toBe(true)
  })

  it("rejects rating below 0", () => {
    expect(
      ReviewSubmissionSchema.safeParse({ items: [item({ rating: -1 })] }).success,
    ).toBe(false)
  })

  it("rejects rating above 5", () => {
    expect(
      ReviewSubmissionSchema.safeParse({ items: [item({ rating: 6 })] }).success,
    ).toBe(false)
  })

  it("rejects non-integer rating", () => {
    expect(
      ReviewSubmissionSchema.safeParse({ items: [item({ rating: 3.5 })] }).success,
    ).toBe(false)
  })

  it("rejects unknown mode", () => {
    expect(
      ReviewSubmissionSchema.safeParse({ items: [item({ mode: "exam" })] }).success,
    ).toBe(false)
  })

  it("accepts both flashcard and quiz modes", () => {
    expect(
      ReviewSubmissionSchema.safeParse({
        items: [item({ mode: "flashcard" }), item({ mode: "quiz" })],
      }).success,
    ).toBe(true)
  })

  it("rejects empty cardId", () => {
    expect(
      ReviewSubmissionSchema.safeParse({ items: [item({ cardId: "" })] }).success,
    ).toBe(false)
  })
})
