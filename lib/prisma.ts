import { PrismaClient } from "@prisma/client"
import { PrismaLibSQL } from "@prisma/adapter-libsql"

function resolveDbUrl(): string {
  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db"
  // Prisma CLI's "file:./dev.db" resolves relative to schema.prisma (= prisma/dev.db).
  // @libsql/client resolves relative to cwd, so bridge them when running the app.
  if (url === "file:./dev.db") return "file:./prisma/dev.db"
  return url
}

export function createPrismaClient(opts: { logQueries?: boolean } = {}): PrismaClient {
  const adapter = new PrismaLibSQL({
    url: resolveDbUrl(),
    authToken: process.env.TURSO_AUTH_TOKEN,
  })
  return new PrismaClient({
    adapter,
    log: opts.logQueries
      ? ["query", "error", "warn"]
      : process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  })
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
