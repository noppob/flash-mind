import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { LoginSchema } from "@/lib/validation/auth"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const parsed = LoginSchema.safeParse(creds)
        if (!parsed.success) return null
        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        })
        if (!user?.passwordHash) return null
        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash)
        if (!ok) return null
        return {
          id: user.id,
          email: user.email,
          name: user.displayName,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = (user as { id?: string }).id
      }
      return token
    },
    async session({ session, token }) {
      if (token.uid && session.user) {
        ;(session.user as { id?: string }).id = token.uid as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})
