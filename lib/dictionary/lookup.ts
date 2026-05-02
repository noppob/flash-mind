import { prisma } from "@/lib/prisma"

export type DictHit = {
  headword: string
  pos: string | null
  definition: string
  note: string | null
  aliasOf: string | null
}

const SELECT = {
  headword: true,
  pos: true,
  definition: true,
  note: true,
  aliasOf: true,
} as const

function normalize(input: string): string {
  return input.trim().toLowerCase()
}

export async function lookupExact(
  word: string,
  opts: { limit?: number } = {},
): Promise<DictHit[]> {
  const needle = normalize(word)
  if (!needle) return []
  return prisma.dictionaryEntry.findMany({
    where: { headwordLower: needle },
    take: opts.limit ?? 20,
    select: SELECT,
  })
}

export async function searchPrefix(
  prefix: string,
  opts: { limit?: number; distinct?: boolean } = {},
): Promise<DictHit[]> {
  const needle = normalize(prefix)
  if (!needle) return []
  return prisma.dictionaryEntry.findMany({
    where: { headwordLower: { startsWith: needle } },
    take: opts.limit ?? 20,
    orderBy: { headwordLower: "asc" },
    distinct: opts.distinct ? ["headwordLower"] : undefined,
    select: SELECT,
  })
}

// 日→英の逆引き。definition (訳本文) を部分一致で検索する。
// PG/SQLite とも definition に GIN/FTS インデックスを張っていないので
// 全表スキャンに近い挙動になる。実用上 limit を必ず付ける。
export async function searchByDefinition(
  query: string,
  opts: { limit?: number; distinct?: boolean } = {},
): Promise<DictHit[]> {
  const needle = query.trim()
  if (!needle) return []
  const limit = opts.limit ?? 20
  return prisma.dictionaryEntry.findMany({
    where: { definition: { contains: needle } },
    take: limit,
    distinct: opts.distinct ? ["headwordLower"] : undefined,
    orderBy: { headword: "asc" },
    select: SELECT,
  })
}

export async function searchPartial(
  query: string,
  opts: { limit?: number; distinct?: boolean } = {},
): Promise<DictHit[]> {
  const needle = normalize(query)
  if (!needle) return []
  const limit = opts.limit ?? 20
  return prisma.dictionaryEntry.findMany({
    where: { headwordLower: { contains: needle } },
    take: limit,
    distinct: opts.distinct ? ["headwordLower"] : undefined,
    orderBy: { headwordLower: "asc" },
    select: SELECT,
  })
}

// Crude lemma fallback: strip common inflectional endings once.
// We do not use a real lemmatizer; the dictionary already covers many forms.
function lemmaCandidate(word: string): string | null {
  if (word.length <= 4) return null
  if (word.endsWith("ies")) return `${word.slice(0, -3)}y`
  if (word.endsWith("ied")) return `${word.slice(0, -3)}y`
  if (word.endsWith("ing")) return word.slice(0, -3)
  if (word.endsWith("ed")) return word.slice(0, -2)
  if (word.endsWith("es")) return word.slice(0, -2)
  if (word.endsWith("s")) return word.slice(0, -1)
  return null
}

export async function lookupForGrounding(word: string): Promise<DictHit[]> {
  const needle = normalize(word)
  if (!needle) return []
  const direct = await lookupExact(needle, { limit: 10 })
  if (direct.length > 0) return direct
  const lemma = lemmaCandidate(needle)
  if (lemma && lemma !== needle) {
    return lookupExact(lemma, { limit: 10 })
  }
  return []
}
