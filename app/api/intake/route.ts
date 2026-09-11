import { prisma } from '@/lib/prisma'
import { actor, failure, input, json } from '@/lib/client-auth'
import { intakeInput } from '@/lib/validation'

export async function GET(req: Request) {
  try {
    const { client } = await actor(req)
    const intake = await prisma.intake.findUnique({ where: { clientId: client.id } })
    return json({ intake })
  } catch (e) { return failure(e) }
}

export async function PUT(req: Request) {
  try {
    const { client } = await actor(req)
    const data = await input(req, intakeInput)
    const intake = await prisma.intake.upsert({
      where: { clientId: client.id },
      create: { clientId: client.id, ...data },
      update: data,
    })
    return json({ intake })
  } catch (e) { return failure(e) }
}
