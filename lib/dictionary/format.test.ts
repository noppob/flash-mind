import { describe, it, expect } from "vitest"
import { formatHitsForPrompt } from "./format"
import type { DictHit } from "./lookup"

const hit = (overrides: Partial<DictHit> = {}): DictHit => ({
  headword: "abandon",
  pos: "動-1",
  definition: "～を捨てる、見捨てる、放棄する",
  note: null,
  aliasOf: null,
  ...overrides,
})

describe("formatHitsForPrompt", () => {
  it("formats numbered list with pos in braces", () => {
    const out = formatHitsForPrompt([
      hit(),
      hit({ pos: "動-2", definition: "～を中止する、断念する" }),
      hit({ pos: "名", definition: "奔放、気まま" }),
    ])
    expect(out).toBe(
      "1. abandon {動-1}: ～を捨てる、見捨てる、放棄する\n" +
        "2. abandon {動-2}: ～を中止する、断念する\n" +
        "3. abandon {名}: 奔放、気まま",
    )
  })

  it("omits pos brace when pos is null", () => {
    const out = formatHitsForPrompt([hit({ pos: null, definition: "意味" })])
    expect(out).toBe("1. abandon: 意味")
  })

  it("truncates very long definitions", () => {
    const long = "a".repeat(300)
    const out = formatHitsForPrompt([hit({ pos: null, definition: long })])
    expect(out.endsWith("…")).toBe(true)
    expect(out.length).toBeLessThan(long.length + 20)
  })

  it("caps the number of hits at MAX_HITS", () => {
    const many = Array.from({ length: 15 }, (_, i) =>
      hit({ definition: `def${i}` }),
    )
    const out = formatHitsForPrompt(many)
    const lines = out.split("\n")
    expect(lines.length).toBe(10)
    expect(lines[0]).toContain("def0")
    expect(lines[9]).toContain("def9")
  })
})
