import { describe, it, expect } from "vitest"
import { extractYouTubeId } from "./youtube"

describe("extractYouTubeId()", () => {
  const ID = "dQw4w9WgXcQ" // 11 chars

  it("parses standard watch?v= URLs", () => {
    expect(extractYouTubeId(`https://www.youtube.com/watch?v=${ID}`)).toBe(ID)
  })

  it("parses youtu.be short URLs", () => {
    expect(extractYouTubeId(`https://youtu.be/${ID}`)).toBe(ID)
  })

  it("parses /shorts/ URLs", () => {
    expect(extractYouTubeId(`https://youtube.com/shorts/${ID}`)).toBe(ID)
  })

  it("parses /embed/ URLs", () => {
    expect(extractYouTubeId(`https://www.youtube.com/embed/${ID}`)).toBe(ID)
  })

  it("parses /live/ URLs", () => {
    expect(extractYouTubeId(`https://www.youtube.com/live/${ID}`)).toBe(ID)
  })

  it("parses bare 11-char IDs", () => {
    expect(extractYouTubeId(ID)).toBe(ID)
  })

  it("trims surrounding whitespace", () => {
    expect(extractYouTubeId(`  https://youtu.be/${ID}  `)).toBe(ID)
  })

  it("ignores extra query parameters", () => {
    expect(
      extractYouTubeId(`https://www.youtube.com/watch?v=${ID}&t=42&list=PLfoo`),
    ).toBe(ID)
  })

  it("returns null for non-YouTube URLs", () => {
    expect(extractYouTubeId("https://example.com/video/abc")).toBeNull()
  })

  it("returns null for IDs shorter than 11 chars", () => {
    expect(extractYouTubeId("short")).toBeNull()
    expect(extractYouTubeId("https://youtu.be/short")).toBeNull()
  })

  it("returns null for empty string", () => {
    expect(extractYouTubeId("")).toBeNull()
  })
})
