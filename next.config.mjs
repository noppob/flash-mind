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
}

export default nextConfig
