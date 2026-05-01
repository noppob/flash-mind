import { describe, it, expect } from "vitest"
import { progressMap } from "./progress"

describe("progressMap()", () => {
  it("returns `to` when total is 0 (avoids divide-by-zero)", () => {
    expect(progressMap(0, 0, 15, 85)).toBe(85)
  })

  it("returns `to` when total is negative", () => {
    expect(progressMap(0, -5, 15, 85)).toBe(85)
  })

  it("returns `from` when done is 0", () => {
    expect(progressMap(0, 10, 15, 85)).toBe(15)
  })

  it("returns `to` when done equals total", () => {
    expect(progressMap(10, 10, 15, 85)).toBe(85)
  })

  it("interpolates linearly at the midpoint", () => {
    expect(progressMap(5, 10, 0, 100)).toBe(50)
  })

  it("clamps when done > total", () => {
    expect(progressMap(20, 10, 0, 100)).toBe(100)
  })

  it("clamps when done is negative", () => {
    expect(progressMap(-5, 10, 0, 100)).toBe(0)
  })

  it("rounds to the nearest integer", () => {
    // 1/3 of (0..100) = 33.33... → rounds to 33
    expect(progressMap(1, 3, 0, 100)).toBe(33)
    // 2/3 → 66.66... → rounds to 67
    expect(progressMap(2, 3, 0, 100)).toBe(67)
  })
})
