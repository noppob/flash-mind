import { withUser, jsonError } from "@/lib/auth-helpers"
import {
  DictionarySearchQuerySchema,
  type DictionarySearchResponse,
} from "@/lib/validation/dictionary"
import {
  lookupExact,
  searchPrefix,
  searchPartial,
  searchByDefinition,
} from "@/lib/dictionary/lookup"

export async function GET(req: Request) {
  return withUser(async () => {
    const url = new URL(req.url)
    const parsed = DictionarySearchQuerySchema.safeParse({
      q: url.searchParams.get("q") ?? "",
      mode: url.searchParams.get("mode") ?? undefined,
      direction: url.searchParams.get("direction") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      distinct: url.searchParams.get("distinct") ?? undefined,
    })
    if (!parsed.success) {
      return jsonError(422, "VALIDATION", parsed.error.message)
    }
    const { q, mode, direction, limit, distinct } = parsed.data

    const hits =
      direction === "ja2en"
        ? await searchByDefinition(q, { limit, distinct })
        : mode === "exact"
          ? await lookupExact(q, { limit })
          : mode === "prefix"
            ? await searchPrefix(q, { limit, distinct })
            : await searchPartial(q, { limit, distinct })

    const body: DictionarySearchResponse = { q, mode, direction, hits }
    return Response.json(body)
  })
}
