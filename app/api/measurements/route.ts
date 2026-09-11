import { prisma } from '@/lib/prisma'
import { actor, failure, input, json } from '@/lib/client-auth'
import { measurementInput } from '@/lib/validation'

export async function GET(req: Request) {
  try {
    const { client } = await actor(req)
    const measurements = await prisma.measurement.findMany({
      where: { clientId: client.id }, orderBy: { date: 'asc' }, take: 500,
    })
    return json({ measurements })
  } catch (e) { return failure(e) }
}

export async function POST(req: Request) {
  try {
    const { client } = await actor(req)
    const data = await input(req, measurementInput)
    // O singură măsurătoare per zi — dacă se trimite din nou pentru aceeași dată, o înlocuim.
    const existing = await prisma.measurement.findFirst({ where: { clientId: client.id, date: data.date } })
    const measurement = existing
      ? await prisma.measurement.update({ where: { id: existing.id }, data })
      : await prisma.measurement.create({ data: { ...data, clientId: client.id } })
    return json({ measurement }, existing ? 200 : 201)
  } catch (e) { return failure(e) }
}
