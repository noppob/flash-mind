import { prisma } from "@/lib/prisma"
import { withUser, jsonError } from "@/lib/auth-helpers"

type Ctx = { params: Promise<{ cardId: string }> }

export async function POST(_req: Request, ctx: Ctx) {
  return withUser(async ({ userId }) => {
    const { cardId } = await ctx.params
    const card = await prisma.card.findFirst({
      where: { id: cardId, deck: { userId } },
      select: { id: true, flagged: true },
    })
    if (!card) return jsonError(404, "NOT_FOUND", "Card not found")
    const updated = await prisma.card.update({
      where: { id: cardId },
      data: { flagged: !card.flagged },
      select: { id: true, flagged: true },
    })
    return Response.json(updated)
  })
}
