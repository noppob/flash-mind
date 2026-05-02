import { fileURLToPath } from "node:url"
import { dirname } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  // Pin the workspace root so Turbopack stops walking parent directories looking
  // for a lockfile (causes false-positive "couldn't find next/package.json" errors).
  turbopack: {
    root: __dirname,
  },
  // Keep these packages out of Next.js's server bundle. They have native
  // bindings or rely on Node's CJS resolution that breaks when bundled
  // (manifests as 500s on Vercel even when local dev/build succeeds).
  serverExternalPackages: [
    "@libsql/client",
    "@prisma/adapter-libsql",
    "@prisma/client",
  ],
}

export default nextConfig
