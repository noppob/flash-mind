import { z } from "zod"

const ReviewItemSchema = z.object({
  cardId: z.string().min(1),
  mode: z.enum(["flashcard", "quiz"]),
  rating: z.number().int().min(0).max(5),
  correct: z.boolean(),
})

export const ReviewSubmissionSchema = z.object({
  items: z.array(ReviewItemSchema).min(1).max(200),
})

export type ReviewItemInput = z.infer<typeof ReviewItemSchema>
export type ReviewSubmissionInput = z.infer<typeof ReviewSubmissionSchema>
