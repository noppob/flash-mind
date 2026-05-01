import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { jsonError } from "@/lib/auth-helpers"
import { SignupSchema } from "@/lib/validation/auth"

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return jsonError(400, "BAD_JSON", "Invalid JSON body")
  }

  const parsed = SignupSchema.safeParse(body)
  if (!parsed.success) {
    return jsonError(422, "VALIDATION", parsed.error.message)
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  })
  if (existing) {
    return jsonError(409, "EMAIL_TAKEN", "Email already registered")
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10)
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      passwordHash,
      displayName: parsed.data.displayName,
    },
    select: { id: true, email: true, displayName: true },
  })

  return Response.json({ user }, { status: 201 })
}
