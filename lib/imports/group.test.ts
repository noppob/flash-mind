import { describe, it, expect } from "vitest"
import { groupSegmentsBy10Seconds, GROUP_BUCKET_SECONDS } from "./group"

describe("groupSegmentsBy10Seconds()", () => {
  it("returns [] for an empty input", () => {
    expect(groupSegmentsBy10Seconds([])).toEqual([])
  })

  it("flushes a single short segment as one bucket", () => {
    const r = groupSegmentsBy10Seconds([{ time: 3, text: "hello" }])
    expect(r).toEqual([{ time: 3, en: "hello" }])
  })

  it("flushes a bucket once 10 seconds elapsed since bucketStart", () => {
    const r = groupSegmentsBy10Seconds([
      { time: 0, text: "a" },
      { time: 5, text: "b" },
      { time: 10, text: "c" }, // boundary inclusive: flushes here
      { time: 12, text: "d" },
    ])
    expect(r).toEqual([
      { time: 0, en: "a b c" },
      { time: 12, en: "d" },
    ])
  })

  it("rounds bucketStart to the nearest integer", () => {
    const r = groupSegmentsBy10Seconds([
      { time: 0.4, text: "a" },
      { time: 0.8, text: "b" },
    ])
    expect(r).toEqual([{ time: 0, en: "a b" }])
  })

  it("joins with the join-separator and trims the outer whitespace", () => {
    // join(" ") preserves any internal whitespace inside each segment;
    // trim() only strips the outer edges of the final concatenation.
    const r = groupSegmentsBy10Seconds([
      { time: 0, text: "  hello  " },
      { time: 1, text: " world " },
    ])
    // "  hello  " + " " + " world " → "  hello   world " → trim → "hello   world"
    expect(r[0].en).toBe("hello    world")
  })

  it("creates a new bucket per 10-second window across many segments", () => {
    const r = groupSegmentsBy10Seconds([
      { time: 0, text: "x" },
      { time: 10, text: "y" }, // boundary, flushes after push → bucket1: "x y"
      { time: 11, text: "z" }, // bucketStart=11
      { time: 21, text: "w" }, // 21-11=10 → flushes → bucket2: "z w"
    ])
    expect(r).toEqual([
      { time: 0, en: "x y" },
      { time: 11, en: "z w" },
    ])
  })

  it("exposes the bucket size constant", () => {
    expect(GROUP_BUCKET_SECONDS).toBe(10)
  })
})
