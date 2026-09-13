import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { failure, input, json, requireInstructor } from '@/lib/client-auth'

const setSchema = z.object({ reps: z.string().max(30), weight: z.string().max(30), rpe: z.string().max(20), duration: z.string().max(30) }).strict()
const exerciseSchema = z.object({ name: z.string().trim().min(1).max(150), muscleGroup: z.string().max(50), sets: z.array(setSchema).min(1).max(20) }).strict()
const daySchema = z.object({ day: z.number().int().min(1).max(7), label: z.string().max(100), notes: z.string().max(2000), exercises: z.array(exerciseSchema).max(50) }).strict()
const programData = z.object({ weeks: z.array(z.object({ number: z.number().int().min(1).max(52), days: z.array(daySchema).min(1).max(7) }).strict()).min(1).max(52) }).strict()
const mutation = z.discriminatedUnion('action', [
  z.object({ action: z.literal('create'), name: z.string().trim().min(1).max(150), description: z.string().max(2000), kind: z.enum(['WORKOUT', 'NUTRITION']), clientId: z.string().nullable(), data: programData }).strict(),
  z.object({ action: z.literal('update'), id: z.string().min(1), name: z.string().trim().min(1).max(150), description: z.string().max(2000), status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']), clientId: z.string().nullable(), data: programData }).strict(),
  z.object({ action: z.literal('delete'), id: z.string().min(1) }).strict(),
])

export async function GET() {
  try {
    const instructorId = await requireInstructor()
    const [programs, clients] = await Promise.all([
      prisma.program.findMany({ where: { instructorId }, include: { client: { select: { id: true, name: true } } }, orderBy: { updatedAt: 'desc' } }),
      prisma.client.findMany({ where: { instructorId, active: true }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    ])
    return json({ programs, clients })
  } catch (e) { return failure(e) }
}

export async function POST(req: Request) {
  try {
    const instructorId = await requireInstructor()
    const body = await input(req, mutation)
    if ('clientId' in body && body.clientId) {
      const client = await prisma.client.findFirst({ where: { id: body.clientId, instructorId } })
      if (!client) return json({ error: 'Client inexistent.' }, 404)
    }
    if (body.action === 'delete') {
      await prisma.program.deleteMany({ where: { id: body.id, instructorId } })
      return json({ ok: true })
    }
    if (body.action === 'create') {
      const program = await prisma.program.create({ data: { instructorId, name: body.name, description: body.description, kind: body.kind, clientId: body.clientId, data: body.data } })
      return json({ program }, 201)
    }
    const existing = await prisma.program.findFirst({ where: { id: body.id, instructorId } })
    if (!existing) return json({ error: 'Program inexistent.' }, 404)
    const program = await prisma.program.update({ where: { id: existing.id }, data: { name: body.name, description: body.description, status: body.status, clientId: body.clientId, data: body.data } })
    return json({ program })
  } catch (e) { return failure(e) }
}
