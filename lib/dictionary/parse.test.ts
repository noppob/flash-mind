import { describe, it, expect } from "vitest"
import { parseLine } from "./parse"

describe("parseLine", () => {
  it("simple word with pos and note", () => {
    const e = parseLine(
      "■abandon  {動-1} : ～を捨てる、見捨てる、放棄する◆【用法】物事に対して",
    )
    expect(e).not.toBeNull()
    expect(e!.headword).toBe("abandon")
    expect(e!.headwordLower).toBe("abandon")
    expect(e!.pos).toBe("動-1")
    expect(e!.definition).toBe("～を捨てる、見捨てる、放棄する")
    expect(e!.note).toBe("【用法】物事に対して")
    expect(e!.aliasOf).toBeNull()
  })

  it("headword with internal space, no pos", () => {
    const e = parseLine("■$1 store : 米国版100円ショップ")
    expect(e!.headword).toBe("$1 store")
    expect(e!.headwordLower).toBe("$1 store")
    expect(e!.pos).toBeNull()
    expect(e!.definition).toBe("米国版100円ショップ")
    expect(e!.note).toBeNull()
  })

  it("phrase headword with quotes and spaces", () => {
    const e = parseLine(
      '■"V for Victory" sign : 《the ～》〔人さし指と中指で作る〕勝利を意味するVサイン◆【類】peace sign',
    )
    expect(e!.headword).toBe('"V for Victory" sign')
    expect(e!.pos).toBeNull()
    expect(e!.definition).toContain("勝利を意味するVサイン")
    expect(e!.note).toBe("【類】peace sign")
  })

  it("uppercase headword normalizes lower for lookup", () => {
    const e = parseLine("■ABANDON  {名} : 奔放、気まま")
    expect(e!.headword).toBe("ABANDON")
    expect(e!.headwordLower).toBe("abandon")
  })

  it("alias entry with leading equal sign", () => {
    const e = parseLine("■!  {名} : ＝<→exclamation point>")
    expect(e!.headword).toBe("!")
    expect(e!.pos).toBe("名")
    expect(e!.aliasOf).toBe("exclamation point")
  })

  it("alias entry without equal sign (#one variant)", () => {
    const e = parseLine("■#one standard of excellence : <→#1 standard of excellence>")
    expect(e!.aliasOf).toBe("#1 standard of excellence")
  })

  it("multi-redirect alias takes first target", () => {
    const e = parseLine(
      '■"It\'s me" fraud : ＝<→emergency scam>、<→grandparent scam>',
    )
    expect(e!.aliasOf).toBe("emergency scam")
  })

  it("returns null for non-■ line", () => {
    expect(parseLine("just a comment line")).toBeNull()
    expect(parseLine("")).toBeNull()
    expect(parseLine("\r")).toBeNull()
  })

  it("returns null when separator is missing", () => {
    expect(parseLine("■orphan-no-colon")).toBeNull()
  })

  it("returns null when body is empty", () => {
    expect(parseLine("■word : ")).toBeNull()
    expect(parseLine("■word  {名} : ")).toBeNull()
  })

  it("multi-numbered pos preserved as raw string", () => {
    const e1 = parseLine("■abandon  {動-1} : ～を捨てる")
    const e2 = parseLine("■abandon  {動-2} : ～を中止する")
    expect(e1!.pos).toBe("動-1")
    expect(e2!.pos).toBe("動-2")
    expect(e1!.headwordLower).toBe(e2!.headwordLower)
  })
})
