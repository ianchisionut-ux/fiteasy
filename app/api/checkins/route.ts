import { prisma } from '@/lib/prisma'
import { actor, failure, input, json } from '@/lib/client-auth'
import { checkInInput } from '@/lib/validation'

export async function GET(req: Request) {
  try {
    const { client } = await actor(req)
    const checkIns = await prisma.checkIn.findMany({
      where: { clientId: client.id }, orderBy: { weekOf: 'desc' }, take: 52,
    })
    return json({ checkIns })
  } catch (e) { return failure(e) }
}

export async function POST(req: Request) {
  try {
    const { client, owner } = await actor(req)
    if (owner) return json({ error: 'Doar clientul trimite check-in-ul.' }, 403)
    const { weekOf, ...data } = await input(req, checkInInput)
    const checkIn = await prisma.checkIn.upsert({
      where: { clientId_weekOf: { clientId: client.id, weekOf } },
      create: { clientId: client.id, weekOf, ...data },
      update: data,
    })
    return json({ checkIn }, 201)
  } catch (e) { return failure(e) }
}
