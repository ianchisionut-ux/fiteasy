import { prisma } from '@/lib/prisma'
import { actor, failure, input, json, TIMEZONE } from '@/lib/client-auth'
import { calendarDate, entryPlan } from '@/lib/validation'

export async function GET(req: Request) {
  try {
    const { client } = await actor(req)
    const url = new URL(req.url)
    const from = calendarDate.parse(url.searchParams.get('from'))
    const to = calendarDate.parse(url.searchParams.get('to'))
    if (to < from || Date.parse(to) - Date.parse(from) > 62 * 86400_000) return json({ error: 'Selectează maximum 62 de zile.' }, 400)
    const entries = await prisma.entry.findMany({
      where: { clientId: client.id, date: { gte: from, lte: to } },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
      take: 1500,
    })
    return json({ entries, clientName: client.name, timezone: TIMEZONE })
  } catch (e) { return failure(e) }
}
export async function POST(req: Request) {
  try {
    const { client, owner } = await actor(req)
    if (!owner) return json({ error: 'Doar instructorul poate crea planuri.' }, 403)
    const plan = await input(req, entryPlan)
    return json(await prisma.entry.create({ data: { ...plan, clientId: client.id } }), 201)
  } catch (e) { return failure(e) }
}
