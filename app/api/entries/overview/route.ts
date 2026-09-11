import { prisma } from '@/lib/prisma'
import { failure, json, requireInstructor } from '@/lib/client-auth'
import { calendarDate } from '@/lib/validation'

export async function GET(req: Request) {
  try {
    const instructorId = await requireInstructor()
    const url = new URL(req.url)
    const from = calendarDate.parse(url.searchParams.get('from'))
    const to = calendarDate.parse(url.searchParams.get('to'))
    if (to < from || Date.parse(to) - Date.parse(from) > 62 * 86400_000) return json({ error: 'Selectează maximum 62 de zile.' }, 400)

    const entries = await prisma.entry.findMany({
      where: { date: { gte: from, lte: to }, client: { instructorId } },
      select: { id: true, date: true, kind: true, title: true, time: true, client: { select: { id: true, name: true } } },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
      take: 1000,
    })
    return json({ entries })
  } catch (e) { return failure(e) }
}
