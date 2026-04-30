import { prisma } from "@/lib/prisma"
import { withUser, jsonError } from "@/lib/auth-helpers"
import { MemoSchema } from "@/lib/validation/card"

type Ctx = { params: Promise<{ cardId: string }> }

async function ensureOwnership(userId: string, cardId: string) {
  return prisma.card.findFirst({
    where: { id: cardId, deck: { userId } },
    select: { id: true },
  })
}

export async function GET(_req: Request, ctx: Ctx) {
  return withUser(async ({ userId }) => {
    const { cardId } = await ctx.params
    const owns = await ensureOwnership(userId, cardId)
    if (!owns) return jsonError(404, "NOT_FOUND", "Card not found")
    const memo = await prisma.memo.findUnique({
      where: { userId_cardId: { userId, cardId } },
    })
    return Response.json({ content: memo?.content ?? "" })
  })
}

export async function PUT(req: Request, ctx: Ctx) {
  return withUser(async ({ userId }) => {
    const { cardId } = await ctx.params
    const owns = await ensureOwnership(userId, cardId)
    if (!owns) return jsonError(404, "NOT_FOUND", "Card not found")
    const body = await req.json().catch(() => null)
    const parsed = MemoSchema.safeParse(body)
    if (!parsed.success) return jsonError(422, "VALIDATION", parsed.error.message)

    const memo = await prisma.memo.upsert({
      where: { userId_cardId: { userId, cardId } },
      update: { content: parsed.data.content },
      create: { userId, cardId, content: parsed.data.content },
    })
    return Response.json({ content: memo.content })
  })
}
