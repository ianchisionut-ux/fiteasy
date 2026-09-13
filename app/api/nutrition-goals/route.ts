import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { actor, failure, input, json } from '@/lib/client-auth'
import { calendarDate } from '@/lib/validation'

const goalInput = z.object({ startDate: calendarDate, calories: z.number().int().min(500).max(10000), proteinPercent: z.number().int().min(0).max(100), fatPercent: z.number().int().min(0).max(100), carbsPercent: z.number().int().min(0).max(100), saturatedFat: z.number().int().min(0).nullable(), cholesterol: z.number().int().min(0).nullable(), fibers: z.number().int().min(0).nullable(), sugars: z.number().int().min(0).nullable(), sodium: z.number().int().min(0).nullable(), days: z.string().regex(/^[0-6](,[0-6])*$/), repeatWeeks: z.number().int().min(1).max(52) }).strict().refine(v => v.proteinPercent + v.fatPercent + v.carbsPercent === 100, 'Macro-urile trebuie să însumeze 100%.')

export async function GET(req: Request) {
  try { const { client } = await actor(req); return json({ goals: await prisma.nutritionGoal.findMany({ where: { clientId: client.id }, orderBy: { createdAt: 'desc' } }) }) }
  catch (e) { return failure(e) }
}
export async function POST(req: Request) {
  try { const { client, owner } = await actor(req); if (!owner) return json({ error: 'Doar instructorul poate seta obiective.' }, 403); const body = await input(req, goalInput); await prisma.nutritionGoal.updateMany({ where: { clientId: client.id, active: true }, data: { active: false } }); return json({ goal: await prisma.nutritionGoal.create({ data: { clientId: client.id, ...body } }) }, 201) }
  catch (e) { return failure(e) }
}
