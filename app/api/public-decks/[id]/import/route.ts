import { prisma } from "@/lib/prisma"
import { withUser, jsonError } from "@/lib/auth-helpers"

type Ctx = { params: Promise<{ id: string }> }

export async function POST(_req: Request, ctx: Ctx) {
  return withUser(async ({ userId }) => {
    const { id } = await ctx.params
    const pub = await prisma.publicDeck.findUnique({ where: { id } })
    if (!pub) return jsonError(404, "NOT_FOUND", "Public deck not found")

    const deck = await prisma.deck.create({
      data: {
        userId,
        name: pub.name,
        template: "スタンダード",
        color: "bg-indigo-500",
      },
    })

    // Phase 1: PublicDeck.cards is an empty placeholder. We just clone the deck
    // shell so the user can immediately add cards to it. Phase 2 will hydrate
    // real cards from PublicDeck.cards JSON.
    await prisma.publicDeck.update({
      where: { id },
      data: { downloads: { increment: 1 } },
    })

    return Response.json({ deckId: deck.id }, { status: 201 })
  })
}
