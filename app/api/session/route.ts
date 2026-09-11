import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getClientIp, rateLimit } from '@/lib/rate-limit'
import { failure, hashToken, input, json, newToken, SESSION_COOKIE } from '@/lib/client-auth'

export async function POST(req: Request) {
  try {
    const { token } = await input(req, z.object({ token: z.string().regex(/^[a-f0-9]{64}$/) }).strict())
    if (!rateLimit(`activate:${getClientIp(req)}`, 15, 15 * 60_000).allowed) return json({ error: 'Prea multe încercări. Încearcă peste 15 minute.' }, 429)
    const sessionToken = newToken()
    const expiresAt = new Date(Date.now() + 30 * 24 * 3600_000)
    const success = await prisma.$transaction(async tx => {
      const client = await tx.client.findUnique({ where: { inviteHash: hashToken(token) } })
      if (!client || !client.active) return false
      const consumed = await tx.client.updateMany({
        where: { id: client.id, inviteHash: hashToken(token), inviteExpiresAt: { gt: new Date() } },
        data: { inviteHash: null, inviteExpiresAt: null },
      })
      if (consumed.count !== 1) return false
      await tx.clientSession.deleteMany({ where: { clientId: client.id, expiresAt: { lt: new Date() } } })
      await tx.clientSession.create({ data: { clientId: client.id, tokenHash: hashToken(sessionToken), expiresAt } })
      return true
    })
    if (!success) return json({ error: 'Link expirat sau deja folosit. Solicită unul nou instructorului.' }, 401)
    const response = json({ ok: true })
    response.cookies.set(SESSION_COOKIE, sessionToken, { httpOnly: true, secure: new URL(req.url).protocol === 'https:', sameSite: 'strict', path: '/', expires: expiresAt })
    return response
  } catch (e) { return failure(e) }
}
