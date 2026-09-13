import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { actor, failure, input, json } from '@/lib/client-auth'
import { calendarDate } from '@/lib/validation'

const recordInput = z.object({ exerciseName: z.string().trim().min(1).max(150), date: calendarDate, weight: z.number().min(0).max(1000).nullable(), reps: z.number().int().min(0).max(1000).nullable(), notes: z.string().max(1000) }).strict()

export async function GET(req: Request) {
  try { const { client } = await actor(req); return json({ records: await prisma.progressRecord.findMany({ where: { clientId: client.id }, orderBy: { date: 'asc' }, take: 1000 }) }) }
  catch (e) { return failure(e) }
}
export async function POST(req: Request) {
  try { const { client } = await actor(req); const body = await input(req, recordInput); return json({ record: await prisma.progressRecord.create({ data: { clientId: client.id, ...body } }) }, 201) }
  catch (e) { return failure(e) }
}
