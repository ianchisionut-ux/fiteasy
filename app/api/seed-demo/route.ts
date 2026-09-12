import { addDays, format, subDays } from 'date-fns'
import { prisma } from '@/lib/prisma'
import { failure, json, requireInstructor } from '@/lib/client-auth'

const today = () => format(new Date(), 'yyyy-MM-dd')
const daysAgo = (n: number) => format(subDays(new Date(), n), 'yyyy-MM-dd')
const daysFromNow = (n: number) => format(addDays(new Date(), n), 'yyyy-MM-dd')

export async function POST() {
  try {
    const instructorId = await requireInstructor()

    const existing = await prisma.client.count({ where: { instructorId } })
    if (existing > 0) return json({ error: 'Ai deja clienți — datele demo se adaugă doar pe un cont gol, ca să nu se amestece cu clienți reali.' }, 409)

    const andreea = await prisma.client.create({
      data: {
        instructorId, name: 'Andreea Popescu', phone: '0722 111 222',
        dailyProteinTarget: 130, dailyCarbsTarget: 220, dailyFatTarget: 65, dailyCaloriesTarget: 2000,
        intake: { create: { experienceLevel: 'INTERMEDIAR', goals: 'Recompoziție corporală, mai multă forță la genuflexiuni.', medicalHistory: 'Fără afecțiuni cunoscute.', injuries: 'Ușoară durere la genunchiul drept la fandări adânci.' } },
        entries: { createMany: { data: [
          { kind: 'WORKOUT', date: daysAgo(2), time: '09:00', title: 'Împins culcat cu bara', details: '4 serii x 8 repetări', muscleGroup: 'Piept', completed: true },
          { kind: 'WORKOUT', date: daysAgo(2), time: '09:20', title: 'Ramat cu bara', details: '3 serii x 10 repetări', muscleGroup: 'Spate', completed: true, feedback: 'Am simțit spatele bine azi!' },
          { kind: 'WORKOUT', date: today(), time: '18:00', title: 'Genuflexiuni', details: '4 serii x 8 repetări', muscleGroup: 'Picioare' },
          { kind: 'WORKOUT', date: daysFromNow(2), time: '18:00', title: 'Tracțiuni la bară', details: '4 serii x 6-8 repetări', muscleGroup: 'Spate' },
          { kind: 'NUTRITION', date: today(), time: '08:00', title: 'Mic dejun', details: 'Ovăz cu fructe și iaurt grecesc', protein: 25, carbs: 55, fat: 12, calories: 420 },
          { kind: 'NUTRITION', date: today(), time: '13:00', title: 'Prânz', details: 'Piept de pui, orez, legume la abur', protein: 45, carbs: 70, fat: 15, calories: 620, completed: true },
        ] } },
        measurements: { createMany: { data: [
          { date: daysAgo(28), weight: 68.4, waist: 74, hips: 98, arms: 27 },
          { date: daysAgo(21), weight: 68.0, waist: 73.5, hips: 97.5, arms: 27.2 },
          { date: daysAgo(14), weight: 67.5, waist: 73, hips: 97, arms: 27.5 },
          { date: daysAgo(7), weight: 67.1, waist: 72.5, hips: 96.5, arms: 27.6 },
          { date: today(), weight: 66.8, waist: 72, hips: 96, arms: 27.8 },
        ] } },
        checkIns: { createMany: { data: [
          { weekOf: daysAgo(7), avgWeight: 67.1, energyLevel: 4, dietAdherencePercent: 85, difficulties: 'Weekend-ul a fost mai greu cu mesele.' },
        ] } },
        messages: { createMany: { data: [
          { sender: 'INSTRUCTOR', text: 'Bun venit, Andreea! Ți-am pregătit primul plan — hai să vorbim la primul apel despre obiective.' },
          { sender: 'CLIENT', text: 'Perfect, abia aștept să încep!' },
        ] } },
      },
    })

    await prisma.client.create({
      data: {
        instructorId, name: 'Mihai Ionescu', phone: '0733 444 555',
        dailyProteinTarget: 160, dailyCarbsTarget: 350, dailyFatTarget: 80, dailyCaloriesTarget: 2800,
        intake: { create: { experienceLevel: 'AVANSAT', goals: 'Masă musculară, +5kg în 4 luni.', lifestyle: 'Muncă de birou, stă mult pe scaun.' } },
        entries: { createMany: { data: [
          { kind: 'WORKOUT', date: daysAgo(1), time: '19:00', title: 'Presă pentru picioare', details: '4 serii x 10 repetări', muscleGroup: 'Picioare', completed: true },
          { kind: 'WORKOUT', date: daysFromNow(1), time: '19:00', title: 'Împins din umeri', details: '4 serii x 8 repetări', muscleGroup: 'Umeri' },
          { kind: 'NUTRITION', date: today(), time: '08:00', title: 'Mic dejun', details: 'Ovăz, unt de arahide, banană, lapte', protein: 30, carbs: 90, fat: 20, calories: 650 },
        ] } },
        measurements: { createMany: { data: [
          { date: daysAgo(21), weight: 78.2 },
          { date: daysAgo(7), weight: 79.0 },
          { date: today(), weight: 79.6 },
        ] } },
        messages: { createMany: { data: [
          { sender: 'CLIENT', text: 'Pot să înlocuiesc presa cu genuflexiuni cu haltera azi? Nu e liberă presa la sală.' },
        ] } },
      },
    })

    await prisma.client.create({
      data: {
        instructorId, name: 'Elena Radu', phone: '0744 777 888', active: false,
        intake: { create: { experienceLevel: 'ÎNCEPĂTOR', goals: 'Primii pași — să facă mișcare constant, 3x/săptămână.' } },
      },
    })

    return json({ ok: true, created: 3, names: ['Andreea Popescu', 'Mihai Ionescu', 'Elena Radu'] }, 201)
  } catch (e) { return failure(e) }
}
