import { execSync } from "node:child_process"

// Reset the database to a known state before the test run starts.
// Tests like learning-flow.spec.ts mutate SRS state by submitting reviews; the
// seed re-run guarantees each `pnpm e2e` invocation starts identically.
//
// Set SKIP_SEED=1 to bypass when you're iterating locally on a single spec
// and don't want to wait for the seed every time.
export default async function globalSetup() {
  if (process.env.SKIP_SEED === "1") {
    console.log("[e2e/global-setup] SKIP_SEED=1 — skipping db:seed")
    return
  }
  console.log("[e2e/global-setup] running pnpm db:seed ...")
  execSync("pnpm db:seed", { stdio: "inherit" })
}
