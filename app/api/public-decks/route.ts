import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const category = url.searchParams.get("category") ?? ""
  const q = url.searchParams.get("q")?.toLowerCase() ?? ""

  const decks = await prisma.publicDeck.findMany({
    where: {
      ...(category && category !== "すべて" ? { category } : {}),
      ...(q
        ? { OR: [{ name: { contains: q } }, { author: { contains: q } }] }
        : {}),
    },
    orderBy: { downloads: "desc" },
    select: {
      id: true,
      name: true,
      author: true,
      totalCards: true,
      downloads: true,
      rating: true,
      category: true,
      description: true,
    },
  })
  return Response.json(decks)
}
