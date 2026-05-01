import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { withUser, jsonError } from "@/lib/auth-helpers"

type Ctx = { params: Promise<{ id: string }> }

const PublicCardSchema = z.object({
  word: z.string().min(1).max(120),
  meaning: z.string().min(1).max(400),
  pronunciation: z.string().max(120).nullish(),
  pos: z.string().max(20).nullish(),
  example: z.string().max(800).nullish(),
  exampleHighlight: z.string().max(120).nullish(),
  exampleJa: z.string().max(800).nullish(),
  etymology: z.string().max(2000).nullish(),
  mnemonic: z.string().max(800).nullish(),
  rootImage: z.string().max(800).nullish(),
  explanation: z.string().max(800).nullish(),
})

const PublicCardsSchema = z.array(PublicCardSchema)

export async function POST(_req: Request, ctx: Ctx) {
  return withUser(async ({ userId }) => {
    const { id } = await ctx.params
    const pub = await prisma.publicDeck.findUnique({ where: { id } })
    if (!pub) return jsonError(404, "NOT_FOUND", "Public deck not found")

    const parsed = PublicCardsSchema.safeParse(pub.cards)
    const cards = parsed.success ? parsed.data : []

    const result = await prisma.$transaction(async (tx) => {
      const deck = await tx.deck.create({
        data: {
          userId,
          name: pub.name,
          template: "スタンダード",
          color: "bg-indigo-500",
        },
      })

      for (const c of cards) {
        const card = await tx.card.create({
          data: {
            deckId: deck.id,
            word: c.word,
            meaning: c.meaning,
            pronunciation: c.pronunciation ?? null,
            pos: c.pos ?? null,
            example: c.example ?? null,
            exampleHighlight: c.exampleHighlight ?? null,
            exampleJa: c.exampleJa ?? null,
            etymology: c.etymology ?? null,
            mnemonic: c.mnemonic ?? null,
            rootImage: c.rootImage ?? null,
            explanation: c.explanation ?? null,
          },
        })
        await tx.cardSrsState.create({
          data: { cardId: card.id, userId, nextReviewAt: new Date() },
        })
      }

      await tx.publicDeck.update({
        where: { id },
        data: { downloads: { increment: 1 } },
      })

      return { deckId: deck.id, cardsCreated: cards.length }
    })

    return Response.json(result, { status: 201 })
  })
}
