import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { rateLimit } from './rate-limit'

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials, request) {
        const email = (credentials?.email as string)?.toLowerCase()?.trim()
        if (!email) return null

        const ip = request?.headers?.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
        const emailCheck = rateLimit(`login-email:${email}`, 8, 15 * 60 * 1000)
        const ipCheck = rateLimit(`login-ip:${ip}`, 20, 15 * 60 * 1000)
        if (!emailCheck.allowed || !ipCheck.allowed) {
          throw new Error('Prea multe încercări. Așteaptă 15 minute și încearcă din nou.')
        }

        const instructor = await prisma.instructor.findUnique({ where: { email } })
        if (!instructor) return null
        const valid = await bcrypt.compare(credentials?.password as string, instructor.password)
        if (!valid) return null
        return { id: instructor.id, email: instructor.email, name: instructor.name } as any
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = (user as any).id
      return token
    },
    async session({ session, token }) {
      ;(session as any).instructorId = token.id
      return session
    },
  },
  pages: { signIn: '/login' },
})
