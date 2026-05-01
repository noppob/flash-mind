import { z } from "zod"

const Definition = z.object({
  pos: z.string().min(1),
  items: z.array(z.string()).min(1),
})

const Phrase = z.object({
  en: z.string().min(1),
  ja: z.string().min(1),
})

const RelatedWord = z.object({
  word: z.string().min(1),
  pos: z.string().optional(),
})

const OtherPos = z.object({
  pos: z.string().min(1),
  meaning: z.string().min(1),
})

const Confusable = z.object({
  word: z.string().min(1),
  meaning: z.string().min(1),
  why: z.string().min(1),
})

export const CreateCardSchema = z.object({
  word: z.string().min(1).max(120),
  pronunciation: z.string().max(120).nullish(),
  pos: z.string().max(20).nullish(),
  meaning: z.string().min(1).max(400),
  category: z.string().max(80).nullish(),
  example: z.string().max(800).nullish(),
  exampleHighlight: z.string().max(120).nullish(),
  exampleJa: z.string().max(800).nullish(),
  etymology: z.string().max(2000).nullish(),
  mnemonic: z.string().max(800).nullish(),
  rootImage: z.string().max(800).nullish(),
  explanation: z.string().max(800).nullish(),
  flagged: z.boolean().optional(),
  definitions: z.array(Definition).nullish(),
  phrases: z.array(Phrase).nullish(),
  relatedWords: z.array(RelatedWord).nullish(),
  otherPos: z.array(OtherPos).nullish(),
  confusables: z.array(Confusable).nullish(),
})

export const UpdateCardSchema = CreateCardSchema.partial()

export const BulkCreateCardSchema = z.object({
  cards: z.array(CreateCardSchema).min(1).max(500),
})

export const MemoSchema = z.object({
  content: z.string().max(4000),
})

export type CreateCardInput = z.infer<typeof CreateCardSchema>
export type UpdateCardInput = z.infer<typeof UpdateCardSchema>
