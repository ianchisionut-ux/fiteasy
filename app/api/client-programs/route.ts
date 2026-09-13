import { actor, failure, json } from '@/lib/client-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { client } = await actor(req)
    const programs = await prisma.program.findMany({ where: { clientId: client.id, status: 'ACTIVE' }, orderBy: { updatedAt: 'desc' }, select: { id: true, name: true, description: true, data: true, updatedAt: true } })
    return json({ programs })
  } catch (e) { return failure(e) }
}
