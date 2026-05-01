import { z } from "zod"

export const ImportUrlSchema = z.object({
  type: z.enum(["youtube", "podcast"]),
  url: z.string().url().max(2000),
})

export type ImportUrlInput = z.infer<typeof ImportUrlSchema>
