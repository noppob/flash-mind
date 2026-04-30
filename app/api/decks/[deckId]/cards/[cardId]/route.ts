import { prisma } from "@/lib/prisma"
import { withUser, jsonError } from "@/lib/auth-helpers"
import { UpdateCardSchema } from "@/lib/validation/card"

type Ctx = { params: Promise<{ deckId: string; cardId: string }> }

async function ensureOwnership(userId: string, deckId: string, cardId: string) {
  const card = await prisma.card.findFirst({
    where: { id: cardId, deckId, deck: { userId } },
  })
  return card
}

export async function GET(_req: Request, ctx: Ctx) {
  return withUser(async ({ userId }) => {
    const { deckId, cardId } = await ctx.params
    const card = await prisma.card.findFirst({
      where: { id: cardId, deckId, deck: { userId } },
      include: {
        srsStates: {
          where: { userId },
          select: { mastery: true, nextReviewAt: true, easeFactor: true },
        },
        memos: { where: { userId }, select: { content: true } },
      },
    })
    if (!card) return jsonError(404, "NOT_FOUND", "Card not found")
    const srs = card.srsStates[0]
    return Response.json({
      ...card,
      mastery: srs?.mastery ?? 1,
      nextReviewAt: srs?.nextReviewAt ?? null,
      easeFactor: srs?.easeFactor ?? 2.5,
      memo: card.memos[0]?.content ?? "",
      srsStates: undefined,
      memos: undefined,
    })
  })
}

export async function PATCH(req: Request, ctx: Ctx) {
  return withUser(async ({ userId }) => {
    const { deckId, cardId } = await ctx.params
    const owns = await ensureOwnership(userId, deckId, cardId)
    if (!owns) return jsonError(404, "NOT_FOUND", "Card not found")
    const body = await req.json().catch(() => null)
    const parsed = UpdateCardSchema.safeParse(body)
    if (!parsed.success) return jsonError(422, "VALIDATION", parsed.error.message)
    const card = await prisma.card.update({
      where: { id: cardId },
      data: {
        ...parsed.data,
        definitions: parsed.data.definitions ?? undefined,
        phrases: parsed.data.phrases ?? undefined,
        relatedWords: parsed.data.relatedWords ?? undefined,
        otherPos: parsed.data.otherPos ?? undefined,
        confusables: parsed.data.confusables ?? undefined,
      },
    })
    return Response.json(card)
  })
}

export async function DELETE(_req: Request, ctx: Ctx) {
  return withUser(async ({ userId }) => {
    const { deckId, cardId } = await ctx.params
    const owns = await ensureOwnership(userId, deckId, cardId)
    if (!owns) return jsonError(404, "NOT_FOUND", "Card not found")
    await prisma.card.delete({ where: { id: cardId } })
    return new Response(null, { status: 204 })
  })
}
