import { z } from 'zod'
import { neon } from '@neondatabase/serverless'
import { prisma } from '@/lib/prisma'
import { failure, hashToken, input, requireInstructor, json, newToken } from '@/lib/client-auth'
import { nutritionTargetsInput } from '@/lib/validation'

export async function GET() {
  try {
    const instructorId = await requireInstructor()
    const clients = await prisma.client.findMany({
      where: { instructorId }, orderBy: { name: 'asc' }, take: 1000,
      select: {
        id: true, name: true, phone: true, active: true,
        dailyProteinTarget: true, dailyCarbsTarget: true, dailyFatTarget: true, dailyCaloriesTarget: true,
      },
    })
    return json({ clients })
  } catch (e) { return failure(e) }
}

const createInput = z.object({ action: z.literal('create'), name: z.string().trim().min(1).max(150), phone: z.string().trim().max(30).optional() }).strict()
const updateInput = z.object({ action: z.literal('update'), clientId: z.string().min(1), name: z.string().trim().min(1).max(150), phone: z.string().trim().max(30).optional(), active: z.boolean() }).strict()
const inviteInput = z.object({ action: z.enum(['invite', 'revoke']), clientId: z.string().min(1) }).strict()
const targetsAction = z.object({ action: z.literal('targets'), clientId: z.string().min(1) }).and(nutritionTargetsInput)

export async function POST(req: Request) {
  try {
    const instructorId = await requireInstructor()
    const body = await req.clone().json().catch(() => ({}))

    if (body.action === 'create') {
      const { name, phone } = await input(req, createInput)
      const client = await prisma.client.create({ data: { instructorId, name, phone } })
      return json({ client }, 201)
    }

    if (body.action === 'update') {
      const values = await input(req, updateInput)
      const existing = await prisma.client.findFirst({ where: { id: values.clientId, instructorId } })
      if (!existing) return json({ error: 'Client inexistent.' }, 404)
      const client = await prisma.client.update({ where: { id: existing.id }, data: { name: values.name, phone: values.phone, active: values.active } })
      if (!values.active) await prisma.clientSession.deleteMany({ where: { clientId: existing.id } })
      return json({ client })
    }

    if (body.action === 'targets') {
      const { clientId, ...targets } = await input(req, targetsAction)
      const client = await prisma.client.findFirst({ where: { id: clientId, instructorId } })
      if (!client) return json({ error: 'Client inexistent.' }, 404)
      const updated = await prisma.client.update({ where: { id: client.id }, data: targets })
      return json({ client: updated })
    }

    const { action, clientId } = await input(req, inviteInput)
    const client = await prisma.client.findFirst({ where: { id: clientId, instructorId } })
    if (!client) return json({ error: 'Client inexistent.' }, 404)

    if (action === 'revoke') {
      const sql = neon(process.env.DATABASE_URL ?? '')
      await sql.transaction([
        sql`UPDATE "Client" SET "active" = false, "inviteHash" = NULL, "inviteExpiresAt" = NULL WHERE "id" = ${client.id}`,
        sql`DELETE FROM "ClientSession" WHERE "clientId" = ${client.id}`,
      ])
      return json({ ok: true })
    }

    const token = newToken()
    const expiresAt = new Date(Date.now() + 24 * 3600_000)
    await prisma.client.update({ where: { id: client.id }, data: { active: true, inviteHash: hashToken(token), inviteExpiresAt: expiresAt } })
    // Fragmentul nu ajunge niciodată în log-uri HTTP sau în header-ul referrer.
    return json({ inviteUrl: `${new URL(req.url).origin}/portal/activate#${token}`, expiresAt })
  } catch (e) { return failure(e) }
}
