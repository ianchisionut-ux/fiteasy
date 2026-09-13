import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { actor, failure, input, json, requireInstructor } from '@/lib/client-auth'

const reminderFields = { clientId: z.string().min(1), type: z.enum(['WEIGH_IN', 'PROGRESS_PHOTO', 'AUTO_MESSAGE', 'FITNESS_TEST', 'MEASUREMENT', 'HABIT']), title: z.string().trim().min(1).max(150), details: z.string().max(1000), time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), days: z.string().regex(/^[0-6](,[0-6])*$/), active: z.boolean() }
const mutation = z.discriminatedUnion('action', [
  z.object({ action: z.literal('create'), ...reminderFields }).strict(),
  z.object({ action: z.literal('update'), id: z.string().min(1), ...reminderFields }).strict(),
  z.object({ action: z.literal('delete'), id: z.string().min(1) }).strict(),
])

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    if (url.searchParams.has('clientId') || url.searchParams.get('mode') === 'client') {
      const { client } = await actor(req)
      const reminders = await prisma.reminder.findMany({ where: { clientId: client.id, active: true }, orderBy: { createdAt: 'desc' } })
      return json({ reminders })
    }
    const instructorId = await requireInstructor()
    const [reminders, clients] = await Promise.all([
      prisma.reminder.findMany({ where: { client: { instructorId } }, include: { client: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' } }),
      prisma.client.findMany({ where: { instructorId, active: true }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    ])
    return json({ reminders, clients })
  } catch (e) { return failure(e) }
}

export async function POST(req: Request) {
  try {
    const instructorId = await requireInstructor()
    const body = await input(req, mutation)
    if (body.action === 'delete') {
      await prisma.reminder.deleteMany({ where: { id: body.id, client: { instructorId } } })
      return json({ ok: true })
    }
    const client = await prisma.client.findFirst({ where: { id: body.clientId, instructorId } })
    if (!client) return json({ error: 'Client inexistent.' }, 404)
    const data = { clientId: body.clientId, type: body.type, title: body.title, details: body.details, time: body.time, days: body.days, active: body.active }
    if (body.action === 'create') return json({ reminder: await prisma.reminder.create({ data }) }, 201)
    const existing = await prisma.reminder.findFirst({ where: { id: body.id, client: { instructorId } } })
    if (!existing) return json({ error: 'Reminder inexistent.' }, 404)
    return json({ reminder: await prisma.reminder.update({ where: { id: existing.id }, data }) })
  } catch (e) { return failure(e) }
}
