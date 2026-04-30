import { prisma } from "@/lib/prisma"
import { withUser, jsonError } from "@/lib/auth-helpers"
import { ReviewSubmissionSchema } from "@/lib/validation/review"
import { sm2 } from "@/lib/srs"

export async function POST(req: Request) {
  return withUser(async ({ userId }) => {
    const body = await req.json().catch(() => null)
    const parsed = ReviewSubmissionSchema.safeParse(body)
    if (!parsed.success) return jsonError(422, "VALIDATION", parsed.error.message)

    const { items } = parsed.data
    const cardIds = [...new Set(items.map((i) => i.cardId))]

    // Verify all cards belong to the user
    const ownedCount = await prisma.card.count({
      where: { id: { in: cardIds }, deck: { userId } },
    })
    if (ownedCount !== cardIds.length) {
      return jsonError(404, "NOT_FOUND", "Card not found or not owned")
    }

    const masteryChanges: {
      cardId: string
      word: string
      from: number
      to: number
    }[] = []
    let correctCount = 0
    let totalCount = 0

    await prisma.$transaction(
      async (tx) => {
        for (const item of items) {
          totalCount += 1
          if (item.correct) correctCount += 1

          const [card, prevState] = await Promise.all([
            tx.card.findUnique({ where: { id: item.cardId } }),
            tx.cardSrsState.findUnique({
              where: { userId_cardId: { userId, cardId: item.cardId } },
            }),
          ])
          if (!card) continue

          const prev = prevState ?? {
            easeFactor: 2.5,
            intervalDays: 0,
            repetitions: 0,
            mastery: 1,
            reviewsTotal: 0,
          }
          const next = sm2(
            {
              easeFactor: prev.easeFactor,
              intervalDays: prev.intervalDays,
              repetitions: prev.repetitions,
            },
            item.rating,
          )

          await tx.cardSrsState.upsert({
            where: { userId_cardId: { userId, cardId: item.cardId } },
            update: {
              easeFactor: next.easeFactor,
              intervalDays: next.intervalDays,
              repetitions: next.repetitions,
              reviewsTotal: prev.reviewsTotal + 1,
              nextReviewAt: next.nextReviewAt,
              mastery: next.mastery,
            },
            create: {
              cardId: item.cardId,
              userId,
              easeFactor: next.easeFactor,
              intervalDays: next.intervalDays,
              repetitions: next.repetitions,
              reviewsTotal: 1,
              nextReviewAt: next.nextReviewAt,
              mastery: next.mastery,
            },
          })

          await tx.reviewLog.create({
            data: {
              userId,
              cardId: item.cardId,
              mode: item.mode,
              rating: item.rating,
              correct: item.correct,
              masteryBefore: prev.mastery,
              masteryAfter: next.mastery,
            },
          })

          masteryChanges.push({
            cardId: item.cardId,
            word: card.word,
            from: prev.mastery,
            to: next.mastery,
          })
        }
      },
      { timeout: 15_000 },
    )

    const weakCards = masteryChanges
      .filter((c) => c.to <= 2)
      .map((c) => ({ cardId: c.cardId, word: c.word, mastery: c.to }))

    return Response.json({
      totalCards: totalCount,
      correct: correctCount,
      accuracy: totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0,
      masteryChanges,
      weakCards,
    })
  })
}
