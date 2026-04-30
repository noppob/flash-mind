import { auth } from "@/lib/auth"

export class HttpError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message)
  }
}

export function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status })
}

export async function requireUser(): Promise<{ userId: string }> {
  const session = await auth()
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) {
    throw new HttpError(401, "UNAUTHORIZED", "Login required")
  }
  return { userId }
}

export async function withUser<T>(
  fn: (ctx: { userId: string }) => Promise<T>,
): Promise<T | Response> {
  try {
    const ctx = await requireUser()
    return await fn(ctx)
  } catch (e) {
    if (e instanceof HttpError) return jsonError(e.status, e.code, e.message)
    console.error(e)
    return jsonError(500, "INTERNAL", "Internal server error")
  }
}
