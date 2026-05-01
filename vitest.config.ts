import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ["lib/**/*.test.ts"],
    exclude: ["node_modules", ".next", "e2e/**", "test-results/**"],
    environment: "node",
    globals: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["lib/srs.ts", "lib/imports/**", "lib/validation/**"],
      exclude: ["lib/api/**", "lib/openai.ts", "lib/prisma.ts", "lib/auth*.ts"],
    },
  },
})
