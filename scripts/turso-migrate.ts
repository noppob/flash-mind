/* eslint-disable no-console */
// Apply Prisma migration SQL to Turso (libSQL).
//
// 使い方:
//   DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... pnpm db:turso:deploy
//
// Prisma の `migrate deploy` が libSQL を直接サポートしないため、
// prisma/migrations/*/migration.sql を順次 client.executeMultiple で実行し、
// _prisma_migrations テーブルに適用履歴を残す（Prisma 互換のスキーマ）。

import fs from "node:fs"
import path from "node:path"
import crypto from "node:crypto"
import { createClient } from "@libsql/client"

const url = process.env.DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!url || !url.startsWith("libsql:")) {
  console.error("[turso-migrate] DATABASE_URL must be a libsql:// URL. Aborting.")
  process.exit(1)
}

const client = createClient({ url, authToken })

async function ensureMigrationsTable(): Promise<void> {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS _prisma_migrations (
      id TEXT PRIMARY KEY,
      checksum TEXT NOT NULL,
      finished_at TIMESTAMP,
      migration_name TEXT NOT NULL UNIQUE,
      logs TEXT,
      rolled_back_at TIMESTAMP,
      started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      applied_steps_count INTEGER NOT NULL DEFAULT 0
    )
  `)
}

async function getApplied(): Promise<Set<string>> {
  const result = await client.execute(
    "SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL",
  )
  return new Set(result.rows.map((r) => String(r.migration_name)))
}

async function applyMigration(name: string, sql: string): Promise<void> {
  const checksum = crypto.createHash("sha256").update(sql).digest("hex")
  const id = crypto.randomUUID()
  console.log(`[turso-migrate] applying ${name}`)
  await client.executeMultiple(sql)
  await client.execute({
    sql: "INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, applied_steps_count) VALUES (?, ?, CURRENT_TIMESTAMP, ?, 1)",
    args: [id, checksum, name],
  })
  console.log(`[turso-migrate]   ✓ ${name}`)
}

async function main(): Promise<void> {
  await ensureMigrationsTable()
  const applied = await getApplied()
  console.log(`[turso-migrate] ${applied.size} migration(s) already applied`)

  const migrationsDir = path.join(process.cwd(), "prisma", "migrations")
  const dirs = fs
    .readdirSync(migrationsDir)
    .filter((d) => fs.statSync(path.join(migrationsDir, d)).isDirectory())
    .sort()

  let pending = 0
  for (const dir of dirs) {
    if (applied.has(dir)) {
      console.log(`[turso-migrate]   skip ${dir} (already applied)`)
      continue
    }
    const sqlPath = path.join(migrationsDir, dir, "migration.sql")
    if (!fs.existsSync(sqlPath)) continue
    const sql = fs.readFileSync(sqlPath, "utf-8")
    await applyMigration(dir, sql)
    pending++
  }

  console.log(`[turso-migrate] done (${pending} new migration(s))`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
