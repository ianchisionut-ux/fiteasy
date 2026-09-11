import { prisma } from '@/lib/prisma'
import { actor, failure, input, json } from '@/lib/client-auth'
import { calendarDate, habitLogInput } from '@/lib/validation'

export async function GET(req: Request) {
  try {
    const { client } = await actor(req)
    const url = new URL(req.url)
    const from = calendarDate.parse(url.searchParams.get('from'))
    const to = calendarDate.parse(url.searchParams.get('to'))
    const habits = await prisma.habitLog.findMany({
      where: { clientId: client.id, date: { gte: from, lte: to } }, orderBy: { date: 'asc' },
    })
    return json({ habits })
  } catch (e) { return failure(e) }
}

export async function PUT(req: Request) {
  try {
    const { client, owner } = await actor(req)
    if (owner) return json({ error: 'Doar clientul își bifează propriile obiceiuri.' }, 403)
    const { date, ...data } = await input(req, habitLogInput)
    const habit = await prisma.habitLog.upsert({
      where: { clientId_date: { clientId: client.id, date } },
      create: { clientId: client.id, date, ...data },
      update: data,
    })
    return json({ habit })
  } catch (e) { return failure(e) }
}
