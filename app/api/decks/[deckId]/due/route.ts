import { prisma } from "@/lib/prisma"
import { withUser, jsonError } from "@/lib/auth-helpers"

type Ctx = { params: Promise<{ deckId: string }> }

export async function GET(req: Request, ctx: Ctx) {
  return withUser(async ({ userId }) => {
    const { deckId } = await ctx.params
    const url = new URL(req.url)
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 200)

    const deck = await prisma.deck.findFirst({
      where: { id: deckId, userId },
      select: { id: true },
    })
    if (!deck) return jsonError(404, "NOT_FOUND", "Deck not found")

    const now = new Date()
    const states = await prisma.cardSrsState.findMany({
      where: { userId, nextReviewAt: { lte: now }, card: { deckId } },
      orderBy: { nextReviewAt: "asc" },
      take: limit,
      include: { card: true },
    })

    const cards = states.map((s) => ({
      ...s.card,
      mastery: s.mastery,
      nextReviewAt: s.nextReviewAt,
    }))
    return Response.json(cards)
  })
}
