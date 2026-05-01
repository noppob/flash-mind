import type { DictHit } from "./lookup"

const MAX_HITS = 10
const MAX_DEFINITION_CHARS = 240

export function formatHitsForPrompt(hits: DictHit[]): string {
  return hits
    .slice(0, MAX_HITS)
    .map((h, i) => {
      const pos = h.pos ? ` {${h.pos}}` : ""
      const def =
        h.definition.length > MAX_DEFINITION_CHARS
          ? `${h.definition.slice(0, MAX_DEFINITION_CHARS)}…`
          : h.definition
      return `${i + 1}. ${h.headword}${pos}: ${def}`
    })
    .join("\n")
}
