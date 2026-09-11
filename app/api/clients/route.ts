import { z } from 'zod'
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
      await prisma.$transaction(async tx => {
        await tx.client.update({ where: { id: client.id }, data: { active: false, inviteHash: null, inviteExpiresAt: null } })
        await tx.clientSession.deleteMany({ where: { clientId: client.id } })
      })
      return json({ ok: true })
    }

    const token = newToken()
    const expiresAt = new Date(Date.now() + 24 * 3600_000)
    await prisma.client.update({ where: { id: client.id }, data: { active: true, inviteHash: hashToken(token), inviteExpiresAt: expiresAt } })
    // Fragmentul nu ajunge niciodată în log-uri HTTP sau în header-ul referrer.
    return json({ inviteUrl: `${new URL(req.url).origin}/portal/activate#${token}`, expiresAt })
  } catch (e) { return failure(e) }
}
