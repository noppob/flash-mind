import { describe, it, expect } from "vitest"
import { SignupSchema, LoginSchema } from "./auth"

describe("SignupSchema", () => {
  const valid = {
    email: "tanaka@email.com",
    password: "password123",
    displayName: "Tanaka",
  }

  it("accepts a well-formed signup payload", () => {
    expect(SignupSchema.safeParse(valid).success).toBe(true)
  })

  it("rejects invalid emails", () => {
    expect(SignupSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(
      false,
    )
  })

  it("rejects passwords shorter than 8 chars", () => {
    expect(SignupSchema.safeParse({ ...valid, password: "short1" }).success).toBe(
      false,
    )
  })

  it("rejects passwords longer than 72 chars", () => {
    expect(
      SignupSchema.safeParse({ ...valid, password: "x".repeat(73) }).success,
    ).toBe(false)
  })

  it("rejects empty displayName", () => {
    expect(SignupSchema.safeParse({ ...valid, displayName: "" }).success).toBe(false)
  })

  it("rejects displayName longer than 64 chars", () => {
    expect(
      SignupSchema.safeParse({ ...valid, displayName: "x".repeat(65) }).success,
    ).toBe(false)
  })
})

describe("LoginSchema", () => {
  it("accepts any non-empty password (no min(8) for login)", () => {
    expect(
      LoginSchema.safeParse({ email: "a@b.com", password: "x" }).success,
    ).toBe(true)
  })

  it("rejects empty password", () => {
    expect(
      LoginSchema.safeParse({ email: "a@b.com", password: "" }).success,
    ).toBe(false)
  })

  it("rejects invalid email", () => {
    expect(LoginSchema.safeParse({ email: "no-at", password: "x" }).success).toBe(
      false,
    )
  })
})
