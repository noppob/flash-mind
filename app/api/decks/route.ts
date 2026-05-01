import { prisma } from "@/lib/prisma"
import { withUser } from "@/lib/auth-helpers"
import { CreateDeckSchema } from "@/lib/validation/deck"

export async function GET() {
  return withUser(async ({ userId }) => {
    const decks = await prisma.deck.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      include: {
        _count: { select: { cards: true } },
      },
    })

    const now = new Date()
    const summaries = await Promise.all(
      decks.map(async (deck) => {
        const [mastered, dueToday] = await Promise.all([
          prisma.cardSrsState.count({
            where: {
              userId,
              card: { deckId: deck.id },
              mastery: { gte: 4 },
            },
          }),
          prisma.cardSrsState.count({
            where: {
              userId,
              card: { deckId: deck.id },
              nextReviewAt: { lte: now },
            },
          }),
        ])
        return {
          id: deck.id,
          name: deck.name,
          template: deck.template,
          color: deck.color,
          totalCards: deck._count.cards,
          mastered,
          dueToday,
          createdAt: deck.createdAt,
          updatedAt: deck.updatedAt,
        }
      }),
    )
    return Response.json(summaries)
  })
}

export async function POST(req: Request) {
  return withUser(async ({ userId }) => {
    const body = await req.json().catch(() => null)
    const parsed = CreateDeckSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { error: { code: "VALIDATION", message: parsed.error.message } },
        { status: 422 },
      )
    }
    const deck = await prisma.deck.create({
      data: { ...parsed.data, userId },
    })
    return Response.json(deck, { status: 201 })
  })
}
