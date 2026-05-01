import { prisma } from "@/lib/prisma"
import { withUser, jsonError } from "@/lib/auth-helpers"
import {
  BulkCreateCardSchema,
  CreateCardSchema,
} from "@/lib/validation/card"

type Ctx = { params: Promise<{ deckId: string }> }

export async function GET(req: Request, ctx: Ctx) {
  return withUser(async ({ userId }) => {
    const { deckId } = await ctx.params
    const url = new URL(req.url)
    const q = url.searchParams.get("q")?.toLowerCase() ?? ""
    const flagged = url.searchParams.get("flagged") === "1"
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 200), 500)

    const deck = await prisma.deck.findFirst({
      where: { id: deckId, userId },
      select: { id: true },
    })
    if (!deck) return jsonError(404, "NOT_FOUND", "Deck not found")

    const cards = await prisma.card.findMany({
      where: {
        deckId,
        ...(flagged ? { flagged: true } : {}),
        ...(q ? { word: { contains: q } } : {}),
      },
      orderBy: { createdAt: "asc" },
      take: limit,
      include: {
        srsStates: {
          where: { userId },
          select: { mastery: true, nextReviewAt: true },
        },
      },
    })

    const result = cards.map((card) => {
      const srs = card.srsStates[0]
      return {
        id: card.id,
        word: card.word,
        meaning: card.meaning,
        example: card.example,
        explanation: card.explanation,
        flagged: card.flagged,
        mastery: srs?.mastery ?? 1,
        nextReviewAt: srs?.nextReviewAt ?? null,
      }
    })
    return Response.json(result)
  })
}

export async function POST(req: Request, ctx: Ctx) {
  return withUser(async ({ userId }) => {
    const { deckId } = await ctx.params
    const deck = await prisma.deck.findFirst({
      where: { id: deckId, userId },
      select: { id: true },
    })
    if (!deck) return jsonError(404, "NOT_FOUND", "Deck not found")

    const body = await req.json().catch(() => null)

    // Accept either { cards: [...] } or a single card object.
    const bulk = BulkCreateCardSchema.safeParse(body)
    const single = CreateCardSchema.safeParse(body)

    let inputs: ReturnType<typeof CreateCardSchema.parse>[]
    if (bulk.success) {
      inputs = bulk.data.cards
    } else if (single.success) {
      inputs = [single.data]
    } else {
      return jsonError(
        422,
        "VALIDATION",
        bulk.error?.message ?? single.error?.message ?? "Invalid card payload",
      )
    }

    const created = await prisma.$transaction(async (tx) => {
      const cards = []
      for (const input of inputs) {
        const card = await tx.card.create({
          data: {
            ...input,
            deckId,
            // Prisma Json fields accept undefined to skip; pass null for explicit clear.
            definitions: input.definitions ?? undefined,
            phrases: input.phrases ?? undefined,
            relatedWords: input.relatedWords ?? undefined,
            otherPos: input.otherPos ?? undefined,
            confusables: input.confusables ?? undefined,
          },
        })
        await tx.cardSrsState.create({
          data: { cardId: card.id, userId, nextReviewAt: new Date() },
        })
        cards.push(card)
      }
      return cards
    })

    return Response.json({ created: created.length, cards: created }, { status: 201 })
  })
}
