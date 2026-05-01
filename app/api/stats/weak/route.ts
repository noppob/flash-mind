import { prisma } from "@/lib/prisma"
import { withUser } from "@/lib/auth-helpers"

export async function GET(req: Request) {
  return withUser(async ({ userId }) => {
    const url = new URL(req.url)
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 5), 20)

    const states = await prisma.cardSrsState.findMany({
      where: { userId, mastery: { lte: 2 } },
      orderBy: [{ mastery: "asc" }, { reviewsTotal: "desc" }],
      take: limit,
      include: { card: { select: { id: true, word: true, meaning: true } } },
    })

    const result = states.map((s) => ({
      cardId: s.card.id,
      word: s.card.word,
      meaning: s.card.meaning,
      ef: s.easeFactor,
      reviews: s.reviewsTotal,
      mastery: s.mastery,
    }))
    return Response.json(result)
  })
}
