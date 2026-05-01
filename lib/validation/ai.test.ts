import { describe, it, expect } from "vitest"
import { AiGenerateSchema, AiGenerateResultSchema } from "./ai"

describe("AiGenerateSchema", () => {
  it("accepts a valid word", () => {
    expect(AiGenerateSchema.safeParse({ word: "ubiquitous" }).success).toBe(true)
  })

  it("rejects empty word", () => {
    expect(AiGenerateSchema.safeParse({ word: "" }).success).toBe(false)
  })

  it("rejects word longer than 120 chars", () => {
    expect(AiGenerateSchema.safeParse({ word: "x".repeat(121) }).success).toBe(false)
  })
})

describe("AiGenerateResultSchema", () => {
  it("accepts an object with all four fields", () => {
    expect(
      AiGenerateResultSchema.safeParse({
        meaning: "意味",
        example: "example sentence. / 例文",
        etymology: "語源",
        explanation: "解説",
      }).success,
    ).toBe(true)
  })

  it("rejects when a field is missing", () => {
    expect(
      AiGenerateResultSchema.safeParse({
        meaning: "意味",
        example: "例文",
        etymology: "語源",
      }).success,
    ).toBe(false)
  })
})
