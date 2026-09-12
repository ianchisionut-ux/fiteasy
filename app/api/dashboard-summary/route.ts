import { format, subDays } from 'date-fns'
import { prisma } from '@/lib/prisma'
import { failure, json, requireInstructor } from '@/lib/client-auth'

export async function GET() {
  try {
    const instructorId = await requireInstructor()

    const [totalClients, activeClients] = await Promise.all([
      prisma.client.count({ where: { instructorId } }),
      prisma.client.count({ where: { instructorId, active: true } }),
    ])

    const today = format(new Date(), 'yyyy-MM-dd')
    const todayEntries = await prisma.entry.findMany({
      where: { date: today, client: { instructorId } },
      select: { id: true, time: true, title: true, kind: true, client: { select: { id: true, name: true } } },
      orderBy: { time: 'asc' }, take: 20,
    })

    const recentMessages = await prisma.message.findMany({
      where: { client: { instructorId }, sender: 'CLIENT' },
      select: { id: true, text: true, createdAt: true, client: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }, take: 5,
    })

    // Rata de completare pe ultimele 7 zile, peste toți clienții.
    const from = format(subDays(new Date(), 6), 'yyyy-MM-dd')
    const weekEntries = await prisma.entry.findMany({
      where: { date: { gte: from, lte: today }, client: { instructorId } },
      select: { date: true, completed: true },
    })
    const weeklyCompletion = Array.from({ length: 7 }, (_, i) => {
      const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd')
      const dayEntries = weekEntries.filter(e => e.date === date)
      const rate = dayEntries.length ? Math.round((dayEntries.filter(e => e.completed).length / dayEntries.length) * 100) : 0
      return { date, rate }
    })

    return json({ totalClients, activeClients, todayEntries, recentMessages, weeklyCompletion })
  } catch (e) { return failure(e) }
}
