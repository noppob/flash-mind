import { prisma } from "@/lib/prisma"
import { withUser } from "@/lib/auth-helpers"
import { z } from "zod"

const UpdateMeSchema = z.object({
  displayName: z.string().min(1).max(64).optional(),
  darkMode: z.boolean().optional(),
  ttsLanguage: z.string().min(2).max(20).optional(),
  reminderTime: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  cloudSyncEnabled: z.boolean().optional(),
})

export async function GET() {
  return withUser(async ({ userId }) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        plan: true,
        darkMode: true,
        ttsLanguage: true,
        reminderTime: true,
        cloudSyncEnabled: true,
        createdAt: true,
      },
    })
    return Response.json(user)
  })
}

export async function PATCH(req: Request) {
  return withUser(async ({ userId }) => {
    const body = await req.json().catch(() => null)
    const parsed = UpdateMeSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { error: { code: "VALIDATION", message: parsed.error.message } },
        { status: 422 },
      )
    }
    const user = await prisma.user.update({
      where: { id: userId },
      data: parsed.data,
      select: {
        id: true,
        email: true,
        displayName: true,
        plan: true,
        darkMode: true,
        ttsLanguage: true,
        reminderTime: true,
        cloudSyncEnabled: true,
      },
    })
    return Response.json(user)
  })
}
