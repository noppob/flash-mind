import { z } from "zod"

export const DictionarySearchModeSchema = z.enum(["exact", "prefix", "partial"])
export type DictionarySearchMode = z.infer<typeof DictionarySearchModeSchema>

// "en2ja": 見出し語（英）から訳（日）を引く（既定）
// "ja2en": 訳本文に含まれる日本語から見出し語を逆引きする
export const DictionarySearchDirectionSchema = z.enum(["en2ja", "ja2en"])
export type DictionarySearchDirection = z.infer<typeof DictionarySearchDirectionSchema>

export const DictionarySearchQuerySchema = z.object({
  q: z.string().min(1).max(120),
  mode: DictionarySearchModeSchema.default("exact"),
  direction: DictionarySearchDirectionSchema.default("en2ja"),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  distinct: z.coerce.boolean().default(false),
})
export type DictionarySearchQuery = z.infer<typeof DictionarySearchQuerySchema>

export const DictionaryHitSchema = z.object({
  headword: z.string(),
  pos: z.string().nullable(),
  definition: z.string(),
  note: z.string().nullable(),
  aliasOf: z.string().nullable(),
})
export type DictionaryHit = z.infer<typeof DictionaryHitSchema>

export const DictionarySearchResponseSchema = z.object({
  q: z.string(),
  mode: DictionarySearchModeSchema,
  direction: DictionarySearchDirectionSchema,
  hits: z.array(DictionaryHitSchema),
})
export type DictionarySearchResponse = z.infer<typeof DictionarySearchResponseSchema>

// ─── 取り込みテキストからの未登録語抽出 ────────────────────────────
export const ExtractWordsBodySchema = z.object({
  text: z.string().min(1).max(500_000),
  deckId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
})
export type ExtractWordsBody = z.infer<typeof ExtractWordsBodySchema>

export const ExtractedWordSchema = z.object({
  word: z.string(),
  count: z.number().int().nonnegative(),
  pos: z.string().nullable(),
  definition: z.string(),
})
export type ExtractedWord = z.infer<typeof ExtractedWordSchema>

export const ExtractWordsResponseSchema = z.object({
  unknownWords: z.array(ExtractedWordSchema),
  totalUniqueTokens: z.number().int().nonnegative(),
  totalRegisteredCards: z.number().int().nonnegative(),
})
export type ExtractWordsResponse = z.infer<typeof ExtractWordsResponseSchema>
