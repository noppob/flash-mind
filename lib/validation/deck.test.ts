import { describe, it, expect } from "vitest"
import { CreateDeckSchema, UpdateDeckSchema, DECK_TEMPLATES } from "./deck"

describe("CreateDeckSchema", () => {
  it("applies default template and color when omitted", () => {
    const r = CreateDeckSchema.parse({ name: "TOEIC" })
    expect(r.template).toBe("スタンダード")
    expect(r.color).toBe("bg-blue-500")
  })

  it("rejects empty name", () => {
    expect(CreateDeckSchema.safeParse({ name: "" }).success).toBe(false)
  })

  it("rejects name longer than 80 chars", () => {
    expect(CreateDeckSchema.safeParse({ name: "x".repeat(81) }).success).toBe(false)
  })

  it("rejects unknown template", () => {
    expect(
      CreateDeckSchema.safeParse({ name: "x", template: "中級者向け" }).success,
    ).toBe(false)
  })

  it("accepts every value listed in DECK_TEMPLATES", () => {
    for (const t of DECK_TEMPLATES) {
      expect(CreateDeckSchema.safeParse({ name: "x", template: t }).success).toBe(true)
    }
  })

  it("rejects empty color string", () => {
    expect(CreateDeckSchema.safeParse({ name: "x", color: "" }).success).toBe(false)
  })
})

describe("UpdateDeckSchema", () => {
  it("accepts a fully empty payload (all fields optional)", () => {
    expect(UpdateDeckSchema.safeParse({}).success).toBe(true)
  })

  it("accepts partial updates", () => {
    expect(UpdateDeckSchema.safeParse({ name: "新名前" }).success).toBe(true)
  })

  it("still validates the field constraints when provided", () => {
    expect(UpdateDeckSchema.safeParse({ name: "" }).success).toBe(false)
  })
})
