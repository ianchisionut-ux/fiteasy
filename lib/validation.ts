import { z } from 'zod'

export const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const d = new Date(`${value}T12:00:00Z`)
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value
}, 'Data nu este validă.')
export const entryPlan = z.object({
  kind: z.enum(['NUTRITION', 'WORKOUT']), date: calendarDate,
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  title: z.string().trim().min(1).max(150), details: z.string().trim().max(8000),
  muscleGroup: z.string().trim().max(30).optional(),
  protein: z.number().int().min(0).max(1000).optional(),
  carbs: z.number().int().min(0).max(1000).optional(),
  fat: z.number().int().min(0).max(1000).optional(),
  calories: z.number().int().min(0).max(10000).optional(),
}).strict()
export const clientProgress = z.object({
  completed: z.boolean(), feedback: z.string().trim().max(2000), version: z.number().int().positive(),
}).strict()
export const coachNoteInput = z.object({
  coachNote: z.string().trim().max(2000), version: z.number().int().positive(),
}).strict()
export const entryEdit = entryPlan.extend({ version: z.number().int().positive() }).strict()
export const messageInput = z.object({ text: z.string().trim().min(1).max(4000) }).strict()

export const intakeInput = z.object({
  medicalHistory: z.string().trim().max(4000),
  injuries: z.string().trim().max(4000),
  experienceLevel: z.enum(['ÎNCEPĂTOR', 'INTERMEDIAR', 'AVANSAT', '']),
  lifestyle: z.string().trim().max(4000),
  foodPreferences: z.string().trim().max(2000),
  goals: z.string().trim().max(2000),
}).strict()

export const measurementInput = z.object({
  date: calendarDate,
  weight: z.number().min(20).max(400).optional(),
  waist: z.number().min(20).max(300).optional(),
  hips: z.number().min(20).max(300).optional(),
  arms: z.number().min(5).max(100).optional(),
  thighs: z.number().min(10).max(150).optional(),
  notes: z.string().trim().max(1000).optional(),
}).strict()

export const habitLogInput = z.object({
  date: calendarDate,
  waterMl: z.number().int().min(0).max(15000).optional(),
  steps: z.number().int().min(0).max(100000).optional(),
  sleepHours: z.number().min(0).max(24).optional(),
}).strict()

export const checkInInput = z.object({
  weekOf: calendarDate,
  avgWeight: z.number().min(20).max(400).optional(),
  energyLevel: z.number().int().min(1).max(5).optional(),
  dietAdherencePercent: z.number().int().min(0).max(100).optional(),
  difficulties: z.string().trim().max(2000).optional(),
}).strict()

export const nutritionTargetsInput = z.object({
  dailyProteinTarget: z.number().int().min(0).max(1000).nullable().optional(),
  dailyCarbsTarget: z.number().int().min(0).max(1000).nullable().optional(),
  dailyFatTarget: z.number().int().min(0).max(1000).nullable().optional(),
  dailyCaloriesTarget: z.number().int().min(0).max(10000).nullable().optional(),
}).strict()

export const templateSaveInput = z.object({
  kind: z.enum(['WORKOUT', 'NUTRITION']),
  name: z.string().trim().min(1).max(150),
  data: z.unknown(),
}).strict()

export const applyTemplateInput = z.object({
  kind: z.enum(['WORKOUT', 'NUTRITION']),
  source: z.enum(['built-in', 'custom']),
  templateId: z.string().trim().min(1),
  startDate: calendarDate,
}).strict()

export const registerInput = z.object({
  name: z.string().trim().min(1).max(150),
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
}).strict()
