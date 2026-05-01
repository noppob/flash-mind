// 英辞郎 144-10 の TXT 1 行をパースして DictionaryEntry 相当の構造に変換する。
// フォーマット:
//   ■<headword>[  {<pos>}] : <body>[◆<note>]
// pos マーカーは任意、headword 内に空白が含まれることもある（例: "$1 store"）。
// alias 行は body が "＝<→target>" もしくは "<→target>" 形式。

export type ParsedEntry = {
  headword: string
  headwordLower: string
  pos: string | null
  definition: string
  note: string | null
  aliasOf: string | null
  raw: string
}

const POS_TAIL = /^(.+?)  \{([^}]+)\}$/
const ALIAS_BODY = /^(?:＝)?<→([^>]+)>(?:、<→[^>]+>)*\s*$/

export function parseLine(line: string): ParsedEntry | null {
  if (!line || line.charCodeAt(0) !== 0x25a0 /* ■ */) return null

  const sep = line.indexOf(" : ")
  if (sep === -1) return null

  const left = line.slice(1, sep)
  const body = line.slice(sep + 3)
  if (!left || !body) return null

  let headword = left
  let pos: string | null = null
  const m = left.match(POS_TAIL)
  if (m) {
    headword = m[1]
    pos = m[2]
  }
  headword = headword.trim()
  if (!headword) return null

  let definition = body
  let note: string | null = null
  const noteIdx = body.indexOf("◆")
  if (noteIdx !== -1) {
    definition = body.slice(0, noteIdx).trim()
    note = body.slice(noteIdx + 1).trim() || null
  }
  if (!definition) return null

  let aliasOf: string | null = null
  const aliasMatch = body.match(ALIAS_BODY)
  if (aliasMatch) aliasOf = aliasMatch[1].trim() || null

  return {
    headword,
    headwordLower: headword.toLowerCase(),
    pos,
    definition,
    note,
    aliasOf,
    raw: line,
  }
}
