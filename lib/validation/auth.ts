import { z } from "zod"

export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  displayName: z.string().min(1).max(64),
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(72),
})

export type SignupInput = z.infer<typeof SignupSchema>
export type LoginInput = z.infer<typeof LoginSchema>
