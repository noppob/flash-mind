/* eslint-disable no-console */
// 辞書テーブルを直接 SQL で覗くデバッグ用スクリプト。
// 使い方: DATABASE_URL=... TURSO_AUTH_TOKEN=... pnpm exec tsx scripts/inspect-dict.ts <word>
import { createClient } from "@libsql/client"

const word = (process.argv[2] ?? "test").toLowerCase()

const url = process.env.DATABASE_URL
if (!url) {
  console.error("DATABASE_URL is not set")
  process.exit(1)
}

const c = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN })

async function main() {
  console.log(`=== "${word}" のエントリ調査 ===\n`)

  const exact = await c.execute({
    sql: `SELECT count(*) as n FROM "DictionaryEntry" WHERE "headwordLower" = ?`,
    args: [word],
  })
  console.log(`完全一致件数 (headwordLower = "${word}"): ${exact.rows[0].n}`)

  const prefix = await c.execute({
    sql: `SELECT count(*) as n FROM "DictionaryEntry" WHERE "headwordLower" LIKE ?`,
    args: [`${word}%`],
  })
  console.log(`前方一致件数 (LIKE "${word}%"): ${prefix.rows[0].n}\n`)

  const rows = await c.execute({
    sql: `SELECT id, headword, pos, definition, note, "aliasOf"
          FROM "DictionaryEntry"
          WHERE "headwordLower" = ?
          ORDER BY id LIMIT 20`,
    args: [word],
  })
  console.log(`--- "${word}" の最大20件 ---`)
  for (const r of rows.rows) {
    console.log(
      JSON.stringify({
        id: r.id,
        headword: r.headword,
        pos: r.pos,
        definition: String(r.definition).slice(0, 100),
        note: r.note ? String(r.note).slice(0, 60) : null,
        aliasOf: r.aliasOf,
      }),
    )
  }
  c.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
