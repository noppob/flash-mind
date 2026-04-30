import { prisma } from "@/lib/prisma"
import { withUser } from "@/lib/auth-helpers"

const DAY_MS = 86_400_000
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"]

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export async function GET() {
  return withUser(async ({ userId }) => {
    const now = new Date()
    const today0 = startOfDay(now)
    const weekAgo = new Date(today0.getTime() - 6 * DAY_MS)

    const [logs, decks, totalCards, masteredCards] = await Promise.all([
      prisma.reviewLog.findMany({
        where: { userId, reviewedAt: { gte: weekAgo } },
        select: { reviewedAt: true, correct: true },
        orderBy: { reviewedAt: "asc" },
      }),
      prisma.deck.findMany({
        where: { userId },
        include: { _count: { select: { cards: true } } },
      }),
      prisma.card.count({ where: { deck: { userId } } }),
      prisma.cardSrsState.count({
        where: { userId, mastery: { gte: 4 } },
      }),
    ])

    // Weekly chart: 7 days ending today
    const weeklyData = Array.from({ length: 7 }).map((_, i) => {
      const day = new Date(today0.getTime() - (6 - i) * DAY_MS)
      const next = new Date(day.getTime() + DAY_MS)
      const cards = logs.filter(
        (l) => l.reviewedAt >= day && l.reviewedAt < next,
      ).length
      return {
        day: WEEKDAYS[day.getDay()],
        date: day.toISOString().slice(0, 10),
        cards,
      }
    })
    const maxCards = Math.max(...weeklyData.map((d) => d.cards), 1)
    const weeklyDataWithHeight = weeklyData.map((d) => ({
      ...d,
      height: Math.round((d.cards / maxCards) * 100),
    }))

    const todayCards = weeklyDataWithHeight[weeklyDataWithHeight.length - 1].cards
    const totalCardsThisWeek = weeklyData.reduce((acc, d) => acc + d.cards, 0)
    const correctTotal = logs.filter((l) => l.correct).length
    const avgAccuracy = logs.length > 0 ? Math.round((correctTotal / logs.length) * 100) : 0

    // Streak: consecutive days with at least 1 review ending today (or yesterday)
    const reviewDays = new Set(
      logs.map((l) => startOfDay(l.reviewedAt).toISOString()),
    )
    let streak = 0
    for (let i = 0; ; i++) {
      const day = new Date(today0.getTime() - i * DAY_MS).toISOString()
      if (reviewDays.has(day)) streak += 1
      else if (i === 0) continue // allow today not yet reviewed
      else break
    }

    const deckStats = await Promise.all(
      decks.map(async (d) => {
        const mastered = await prisma.cardSrsState.count({
          where: { userId, card: { deckId: d.id }, mastery: { gte: 4 } },
        })
        const total = d._count.cards
        return {
          id: d.id,
          name: d.name,
          color: d.color,
          total,
          mastered,
          mastery: total > 0 ? Math.round((mastered / total) * 100) : 0,
        }
      }),
    )

    const totalDueToday = await prisma.cardSrsState.count({
      where: { userId, nextReviewAt: { lte: now } },
    })

    return Response.json({
      streak,
      todayCards,
      totalCardsThisWeek,
      avgAccuracy,
      totalCards,
      masteredCards,
      masteryRate: totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0,
      totalDueToday,
      weeklyData: weeklyDataWithHeight,
      deckStats,
    })
  })
}
