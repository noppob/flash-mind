import { describe, it, expect } from "vitest"
import {
  CreateCardSchema,
  UpdateCardSchema,
  BulkCreateCardSchema,
  MemoSchema,
} from "./card"

describe("CreateCardSchema", () => {
  const minimal = { word: "ubiquitous", meaning: "至る所にある" }

  it("accepts a minimal card", () => {
    expect(CreateCardSchema.safeParse(minimal).success).toBe(true)
  })

  it("rejects empty word", () => {
    expect(
      CreateCardSchema.safeParse({ ...minimal, word: "" }).success,
    ).toBe(false)
  })

  it("rejects empty meaning", () => {
    expect(
      CreateCardSchema.safeParse({ ...minimal, meaning: "" }).success,
    ).toBe(false)
  })

  it("rejects word longer than 120 chars", () => {
    expect(
      CreateCardSchema.safeParse({ ...minimal, word: "x".repeat(121) }).success,
    ).toBe(false)
  })

  it("accepts nested definitions", () => {
    const r = CreateCardSchema.safeParse({
      ...minimal,
      definitions: [{ pos: "adj", items: ["everywhere"] }],
    })
    expect(r.success).toBe(true)
  })

  it("rejects definitions with empty items array", () => {
    expect(
      CreateCardSchema.safeParse({
        ...minimal,
        definitions: [{ pos: "adj", items: [] }],
      }).success,
    ).toBe(false)
  })

  it("accepts null for nullish fields", () => {
    expect(
      CreateCardSchema.safeParse({
        ...minimal,
        pronunciation: null,
        pos: null,
        example: null,
      }).success,
    ).toBe(true)
  })
})

describe("UpdateCardSchema", () => {
  it("accepts an empty payload", () => {
    expect(UpdateCardSchema.safeParse({}).success).toBe(true)
  })

  it("validates field constraints when provided", () => {
    expect(UpdateCardSchema.safeParse({ word: "" }).success).toBe(false)
  })
})

describe("BulkCreateCardSchema", () => {
  const card = { word: "x", meaning: "y" }

  it("rejects empty cards array", () => {
    expect(BulkCreateCardSchema.safeParse({ cards: [] }).success).toBe(false)
  })

  it("accepts 1 card", () => {
    expect(BulkCreateCardSchema.safeParse({ cards: [card] }).success).toBe(true)
  })

  it("accepts up to 500 cards", () => {
    expect(
      BulkCreateCardSchema.safeParse({ cards: Array(500).fill(card) }).success,
    ).toBe(true)
  })

  it("rejects more than 500 cards", () => {
    expect(
      BulkCreateCardSchema.safeParse({ cards: Array(501).fill(card) }).success,
    ).toBe(false)
  })

  it("rejects when any card in the array is invalid", () => {
    expect(
      BulkCreateCardSchema.safeParse({
        cards: [card, { word: "", meaning: "y" }],
      }).success,
    ).toBe(false)
  })
})

describe("MemoSchema", () => {
  it("accepts an empty string", () => {
    expect(MemoSchema.safeParse({ content: "" }).success).toBe(true)
  })

  it("accepts up to 4000 chars", () => {
    expect(MemoSchema.safeParse({ content: "x".repeat(4000) }).success).toBe(true)
  })

  it("rejects content longer than 4000 chars", () => {
    expect(MemoSchema.safeParse({ content: "x".repeat(4001) }).success).toBe(false)
  })
})
