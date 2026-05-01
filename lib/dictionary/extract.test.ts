import { describe, it, expect } from "vitest"
import { extractEnglishTokens, sortedByCount } from "./extract"

describe("extractEnglishTokens", () => {
  it("counts case-insensitively, drops short tokens", () => {
    const c = extractEnglishTokens("Hello hello HELLO hi go")
    expect(c.get("hello")).toBe(3)
    expect(c.has("hi")).toBe(false)
    expect(c.has("go")).toBe(false)
  })

  it("filters stopwords", () => {
    const c = extractEnglishTokens("The quick brown fox jumps over the lazy dog")
    expect(c.has("the")).toBe(false)
    expect(c.has("over")).toBe(false)
    expect(c.get("quick")).toBe(1)
    expect(c.get("brown")).toBe(1)
    expect(c.get("fox")).toBe(1)
    expect(c.get("jumps")).toBe(1)
    expect(c.get("lazy")).toBe(1)
    expect(c.get("dog")).toBe(1)
  })

  it("ignores apostrophes by tokenizing on letters only", () => {
    const c = extractEnglishTokens("It's emanating from the abandoned house")
    // it's → it / s で it は stopword、s は短すぎ
    expect(c.has("it")).toBe(false)
    expect(c.has("s")).toBe(false)
    expect(c.get("emanating")).toBe(1)
    expect(c.get("abandoned")).toBe(1)
    expect(c.get("house")).toBe(1)
  })

  it("ignores Japanese, numbers, and punctuation", () => {
    const c = extractEnglishTokens("the apple は 100 yen です。banana!")
    expect(c.has("the")).toBe(false)
    expect(c.get("apple")).toBe(1)
    expect(c.get("yen")).toBe(1)
    expect(c.get("banana")).toBe(1)
  })

  it("returns empty map for empty input", () => {
    expect(extractEnglishTokens("").size).toBe(0)
    expect(extractEnglishTokens("   ").size).toBe(0)
  })
})

describe("sortedByCount", () => {
  it("sorts by count desc then alphabetical", () => {
    const counts = new Map<string, number>([
      ["banana", 2],
      ["apple", 5],
      ["cherry", 5],
    ])
    const sorted = sortedByCount(counts)
    expect(sorted.map((s) => s.word)).toEqual(["apple", "cherry", "banana"])
  })
})
