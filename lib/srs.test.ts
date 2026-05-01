import { describe, it, expect } from "vitest"
import { sm2, quizRating, flashcardRating, type SrsInput } from "./srs"

const FIXED_NOW = new Date("2026-01-01T00:00:00.000Z")
const DAY_MS = 86_400_000

const fresh: SrsInput = { easeFactor: 2.5, intervalDays: 0, repetitions: 0 }

describe("sm2()", () => {
  describe("rating < 3 (forgotten / reset)", () => {
    it("rating=0 resets repetitions to 0 and intervalDays to 1", () => {
      const r = sm2({ easeFactor: 2.5, intervalDays: 30, repetitions: 5 }, 0, FIXED_NOW)
      expect(r.repetitions).toBe(0)
      expect(r.intervalDays).toBe(1)
      expect(r.mastery).toBe(1)
    })

    it("rating=2 (boundary just below 3) also resets", () => {
      const r = sm2({ easeFactor: 2.0, intervalDays: 6, repetitions: 2 }, 2, FIXED_NOW)
      expect(r.repetitions).toBe(0)
      expect(r.intervalDays).toBe(1)
      expect(r.mastery).toBe(1)
    })

    it("does not change easeFactor on reset", () => {
      const before = { easeFactor: 1.8, intervalDays: 6, repetitions: 2 }
      const r = sm2(before, 1, FIXED_NOW)
      expect(r.easeFactor).toBe(1.8)
    })
  })

  describe("rating >= 3 (success)", () => {
    it("first success (repetitions 0 → 1) sets intervalDays to 1, mastery 2", () => {
      const r = sm2(fresh, 5, FIXED_NOW)
      expect(r.repetitions).toBe(1)
      expect(r.intervalDays).toBe(1)
      expect(r.mastery).toBe(2)
    })

    it("second success (repetitions 1 → 2) sets intervalDays to 6, mastery 3", () => {
      const after1 = sm2(fresh, 5, FIXED_NOW)
      const r = sm2(after1, 5, FIXED_NOW)
      expect(r.repetitions).toBe(2)
      expect(r.intervalDays).toBe(6)
      expect(r.mastery).toBe(3)
    })

    it("third+ success uses prev * EF, mastery 4 when intervalDays < 21", () => {
      // After 2 rating=5 successes: EF=2.5+0.1+0.1=2.7, repetitions=2, intervalDays=6.
      // Then rating=4 keeps EF the same (delta = 0.1 - 1*(0.08+0.02) = 0).
      let s: SrsInput = fresh
      s = sm2(s, 5, FIXED_NOW) // rep=1, interval=1, EF=2.6
      s = sm2(s, 5, FIXED_NOW) // rep=2, interval=6, EF=2.7
      const r = sm2(s, 4, FIXED_NOW)
      expect(r.repetitions).toBe(3)
      expect(r.easeFactor).toBeCloseTo(2.7, 10)
      expect(r.intervalDays).toBe(Math.round(6 * 2.7)) // 16
      expect(r.mastery).toBe(4) // 16 < 21
    })

    it("mastery becomes 5 when intervalDays >= 21", () => {
      // Manually craft a state with high intervalDays and EF.
      const r = sm2(
        { easeFactor: 2.6, intervalDays: 20, repetitions: 5 },
        5,
        FIXED_NOW,
      )
      expect(r.intervalDays).toBeGreaterThanOrEqual(21)
      expect(r.mastery).toBe(5)
    })
  })

  describe("easeFactor calculation", () => {
    it("rating=4 keeps easeFactor unchanged (EF + (0.1 - 1*(0.08+0.02)) = EF)", () => {
      const before: SrsInput = { easeFactor: 2.5, intervalDays: 6, repetitions: 2 }
      const r = sm2(before, 4, FIXED_NOW)
      expect(r.easeFactor).toBeCloseTo(2.5, 10)
    })

    it("rating=5 increases easeFactor by 0.1", () => {
      const before: SrsInput = { easeFactor: 2.5, intervalDays: 6, repetitions: 2 }
      const r = sm2(before, 5, FIXED_NOW)
      expect(r.easeFactor).toBeCloseTo(2.6, 10)
    })

    it("rating=3 decreases easeFactor", () => {
      const before: SrsInput = { easeFactor: 2.5, intervalDays: 6, repetitions: 2 }
      const r = sm2(before, 3, FIXED_NOW)
      // 0.1 - 2*(0.08 + 2*0.02) = 0.1 - 2*0.12 = -0.14
      expect(r.easeFactor).toBeCloseTo(2.5 - 0.14, 10)
    })

    it("easeFactor never drops below 1.3 even after many rating=3 reviews", () => {
      let state: SrsInput = { easeFactor: 1.4, intervalDays: 6, repetitions: 2 }
      for (let i = 0; i < 10; i++) state = sm2(state, 3, FIXED_NOW)
      expect(state.easeFactor).toBeGreaterThanOrEqual(1.3)
    })
  })

  describe("nextReviewAt", () => {
    it("equals now + intervalDays days", () => {
      const r = sm2(fresh, 5, FIXED_NOW)
      const expected = new Date(FIXED_NOW.getTime() + r.intervalDays * DAY_MS)
      expect(r.nextReviewAt.toISOString()).toBe(expected.toISOString())
    })

    it("uses current Date when now is omitted", () => {
      const before = Date.now()
      const r = sm2(fresh, 5)
      const after = Date.now()
      const t = r.nextReviewAt.getTime()
      expect(t).toBeGreaterThanOrEqual(before + DAY_MS - 100)
      expect(t).toBeLessThanOrEqual(after + DAY_MS + 100)
    })
  })

  describe("intervalDays floor", () => {
    it("does not go below 1 even with very small EF", () => {
      // With EF=1.3 and intervalDays=1, round(1*1.3)=1 → still 1.
      // Edge: contrived EF<1 wouldn't normally happen but Math.max(1, ...) guards it.
      const before: SrsInput = { easeFactor: 1.3, intervalDays: 0, repetitions: 3 }
      const r = sm2(before, 3, FIXED_NOW)
      expect(r.intervalDays).toBeGreaterThanOrEqual(1)
    })
  })
})

describe("quizRating()", () => {
  it("correct → 5", () => expect(quizRating(true)).toBe(5))
  it("incorrect → 2", () => expect(quizRating(false)).toBe(2))
})

describe("flashcardRating()", () => {
  it("remembered → 5", () => expect(flashcardRating(true)).toBe(5))
  it("forgotten → 2", () => expect(flashcardRating(false)).toBe(2))
})
