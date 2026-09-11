import { addDays, format } from 'date-fns'
import { prisma } from '@/lib/prisma'
import { actor, failure, input, json } from '@/lib/client-auth'
import { applyTemplateInput } from '@/lib/validation'
import { WORKOUT_PROGRAMS, NUTRITION_DAYS, type WorkoutProgram, type NutritionDay } from '@/lib/templates'

export async function POST(req: Request) {
  try {
    const { client, owner } = await actor(req)
    if (!owner) return json({ error: 'Doar instructorul poate aplica un șablon.' }, 403)
    const { kind, source, templateId, startDate } = await input(req, applyTemplateInput)

    let data: WorkoutProgram | NutritionDay | undefined
    if (source === 'built-in') {
      data = kind === 'WORKOUT'
        ? WORKOUT_PROGRAMS.find(p => p.id === templateId)
        : NUTRITION_DAYS.find(d => d.id === templateId)
    } else {
      const template = await prisma.template.findFirst({ where: { id: templateId, instructorId: client.instructorId, kind } })
      data = template?.data as unknown as WorkoutProgram | NutritionDay | undefined
    }
    if (!data) return json({ error: 'Șablon inexistent.' }, 404)

    const start = new Date(`${startDate}T12:00:00`)
    const rows: { clientId: string; kind: string; date: string; time: string; title: string; details: string; muscleGroup?: string; protein?: number; carbs?: number; fat?: number; calories?: number }[] = []

    if (kind === 'WORKOUT' && 'days' in data) {
      data.days.forEach((day, i) => {
        const date = format(addDays(start, i), 'yyyy-MM-dd')
        day.entries.forEach((entry, j) => {
          rows.push({ clientId: client.id, kind: 'WORKOUT', date, time: `${String(9 + j).padStart(2, '0')}:00`, title: entry.title, details: entry.details, muscleGroup: entry.muscleGroup })
        })
      })
    } else if (kind === 'NUTRITION' && 'meals' in data) {
      const date = format(start, 'yyyy-MM-dd')
      data.meals.forEach(meal => {
        rows.push({ clientId: client.id, kind: 'NUTRITION', date, time: meal.time, title: meal.title, details: meal.details, protein: meal.protein, carbs: meal.carbs, fat: meal.fat, calories: meal.calories })
      })
    } else {
      return json({ error: 'Tip de șablon nepotrivit.' }, 400)
    }

    if (rows.length > 60) return json({ error: 'Șablonul generează prea multe intrări deodată.' }, 400)
    await prisma.entry.createMany({ data: rows })
    return json({ ok: true, created: rows.length })
  } catch (e) { return failure(e) }
}
