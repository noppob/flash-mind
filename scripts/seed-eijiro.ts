/* eslint-disable no-console */
// 英辞郎 144-10 (Shift JIS, ~2.57M lines) を DictionaryEntry テーブルに投入する。
//
// 使い方:
//   $env:EIJIRO_TXT_PATH = "C:/Users/gogo7/Downloads/EIJIRO144-10/EIJIRO144-10.TXT"
//   pnpm db:seed:eijiro:sqlite          # SQLite (file:./prisma/sqlite/dev.db)
//   pnpm db:seed:eijiro                 # Postgres (Neon, DATABASE_URL に従う)
//
// 既存データがある場合は何もしない。再投入したいときは --reset を付ける。

import fs from "node:fs"
import readline from "node:readline"
import iconv from "iconv-lite"
import { PrismaClient } from "@prisma/client"
import { parseLine, type ParsedEntry } from "../lib/dictionary/parse"

const prisma = new PrismaClient()

const CHUNK = 2000
const PROGRESS_EVERY = 100_000

async function main() {
  const path = process.env.EIJIRO_TXT_PATH
  if (!path) {
    console.error("EIJIRO_TXT_PATH is not set. Aborting.")
    process.exit(1)
  }
  if (!fs.existsSync(path)) {
    console.error(`File not found: ${path}`)
    process.exit(1)
  }

  const reset = process.argv.includes("--reset")
  const existing = await prisma.dictionaryEntry.count()
  if (existing > 0 && !reset) {
    console.log(
      `[seed-eijiro] DictionaryEntry already has ${existing.toLocaleString()} rows. Pass --reset to reseed.`,
    )
    return
  }
  if (reset && existing > 0) {
    console.log(`[seed-eijiro] resetting ${existing.toLocaleString()} rows…`)
    await prisma.dictionaryEntry.deleteMany({})
  }

  console.log(`[seed-eijiro] reading ${path}`)
  const stream = fs
    .createReadStream(path)
    .pipe(iconv.decodeStream("shift_jis"))
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity })

  let total = 0
  let inserted = 0
  let buffer: ParsedEntry[] = []
  let nextProgress = PROGRESS_EVERY
  const startedAt = Date.now()

  const flush = async () => {
    if (buffer.length === 0) return
    const data = buffer
    buffer = []
    await prisma.dictionaryEntry.createMany({ data })
    inserted += data.length
  }

  for await (const line of rl) {
    total++
    const parsed = parseLine(line)
    if (parsed) buffer.push(parsed)
    if (buffer.length >= CHUNK) {
      await flush()
      if (inserted >= nextProgress) {
        const sec = ((Date.now() - startedAt) / 1000).toFixed(0)
        console.log(
          `[seed-eijiro] lines=${total.toLocaleString()} inserted=${inserted.toLocaleString()} (${sec}s)`,
        )
        nextProgress += PROGRESS_EVERY
      }
    }
  }
  await flush()

  const sec = ((Date.now() - startedAt) / 1000).toFixed(0)
  console.log(
    `[seed-eijiro] done. lines=${total.toLocaleString()} inserted=${inserted.toLocaleString()} (${sec}s)`,
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
