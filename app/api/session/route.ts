import { z } from 'zod'
import { neon } from '@neondatabase/serverless'
import { getClientIp, rateLimit } from '@/lib/rate-limit'
import { failure, hashToken, input, json, newToken, SESSION_COOKIE } from '@/lib/client-auth'

export async function POST(req: Request) {
  try {
    const { token } = await input(req, z.object({ token: z.string().regex(/^[a-f0-9]{64}$/) }).strict())
    if (!rateLimit(`activate:${getClientIp(req)}`, 15, 15 * 60_000).allowed) return json({ error: 'Prea multe încercări. Încearcă peste 15 minute.' }, 429)
    const sessionToken = newToken()
    const expiresAt = new Date(Date.now() + 30 * 24 * 3600_000)
    const inviteHash = hashToken(token)
    const sql = neon(process.env.DATABASE_URL ?? '')
    const [, inserted] = await sql.transaction([
      sql`DELETE FROM "ClientSession"
          WHERE "clientId" IN (SELECT "id" FROM "Client" WHERE "inviteHash" = ${inviteHash})
            AND "expiresAt" < NOW()`,
      sql`WITH consumed AS (
            UPDATE "Client"
            SET "inviteHash" = NULL, "inviteExpiresAt" = NULL
            WHERE "inviteHash" = ${inviteHash}
              AND "active" = true
              AND "inviteExpiresAt" > NOW()
            RETURNING "id"
          )
          INSERT INTO "ClientSession" ("id", "clientId", "tokenHash", "expiresAt")
          SELECT ${newToken()}, "id", ${hashToken(sessionToken)}, ${expiresAt}
          FROM consumed
          RETURNING "id"`,
    ])
    const success = inserted.length === 1
    if (!success) return json({ error: 'Link expirat sau deja folosit. Solicită unul nou instructorului.' }, 401)
    const response = json({ ok: true })
    response.cookies.set(SESSION_COOKIE, sessionToken, { httpOnly: true, secure: new URL(req.url).protocol === 'https:', sameSite: 'strict', path: '/', expires: expiresAt })
    return response
  } catch (e) { return failure(e) }
}
