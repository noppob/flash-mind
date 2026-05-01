import { prisma } from "@/lib/prisma"
import { withUser, jsonError } from "@/lib/auth-helpers"
import { UpdateDeckSchema } from "@/lib/validation/deck"

type Ctx = { params: Promise<{ deckId: string }> }

export async function GET(_req: Request, ctx: Ctx) {
  return withUser(async ({ userId }) => {
    const { deckId } = await ctx.params
    const deck = await prisma.deck.findFirst({
      where: { id: deckId, userId },
      include: { _count: { select: { cards: true } } },
    })
    if (!deck) return jsonError(404, "NOT_FOUND", "Deck not found")

    const now = new Date()
    const [mastered, dueToday, flaggedCount] = await Promise.all([
      prisma.cardSrsState.count({
        where: { userId, card: { deckId }, mastery: { gte: 4 } },
      }),
      prisma.cardSrsState.count({
        where: { userId, card: { deckId }, nextReviewAt: { lte: now } },
      }),
      prisma.card.count({ where: { deckId, flagged: true } }),
    ])

    return Response.json({
      id: deck.id,
      name: deck.name,
      template: deck.template,
      color: deck.color,
      totalCards: deck._count.cards,
      mastered,
      dueToday,
      flaggedCount,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt,
    })
  })
}

export async function PATCH(req: Request, ctx: Ctx) {
  return withUser(async ({ userId }) => {
    const { deckId } = await ctx.params
    const body = await req.json().catch(() => null)
    const parsed = UpdateDeckSchema.safeParse(body)
    if (!parsed.success) return jsonError(422, "VALIDATION", parsed.error.message)
    const result = await prisma.deck.updateMany({
      where: { id: deckId, userId },
      data: parsed.data,
    })
    if (result.count === 0) return jsonError(404, "NOT_FOUND", "Deck not found")
    const deck = await prisma.deck.findUnique({ where: { id: deckId } })
    return Response.json(deck)
  })
}

export async function DELETE(_req: Request, ctx: Ctx) {
  return withUser(async ({ userId }) => {
    const { deckId } = await ctx.params
    const result = await prisma.deck.deleteMany({
      where: { id: deckId, userId },
    })
    if (result.count === 0) return jsonError(404, "NOT_FOUND", "Deck not found")
    return new Response(null, { status: 204 })
  })
}
