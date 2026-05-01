import { describe, it, expect } from "vitest"
import { AiGenerateSchema } from "./ai"

describe("AiGenerateSchema", () => {
  it("accepts each valid kind", () => {
    for (const kind of ["meaning", "etymology", "explanation"] as const) {
      expect(AiGenerateSchema.safeParse({ kind, word: "test" }).success).toBe(true)
    }
  })

  it("rejects unknown kind", () => {
    expect(
      AiGenerateSchema.safeParse({ kind: "synonym", word: "test" }).success,
    ).toBe(false)
  })

  it("rejects empty word", () => {
    expect(AiGenerateSchema.safeParse({ kind: "meaning", word: "" }).success).toBe(
      false,
    )
  })

  it("rejects word longer than 120 chars", () => {
    expect(
      AiGenerateSchema.safeParse({ kind: "meaning", word: "x".repeat(121) }).success,
    ).toBe(false)
  })

  it("accepts optional meaning", () => {
    expect(
      AiGenerateSchema.safeParse({
        kind: "etymology",
        word: "ubiquitous",
        meaning: "everywhere",
      }).success,
    ).toBe(true)
  })

  it("rejects meaning longer than 400 chars", () => {
    expect(
      AiGenerateSchema.safeParse({
        kind: "meaning",
        word: "x",
        meaning: "y".repeat(401),
      }).success,
    ).toBe(false)
  })
})
