import { prisma } from '@/lib/prisma'
import { failure, input, json, requireInstructor } from '@/lib/client-auth'
import { templateSaveInput } from '@/lib/validation'

export async function GET(req: Request) {
  try {
    const instructorId = await requireInstructor()
    const kind = new URL(req.url).searchParams.get('kind')
    const templates = await prisma.template.findMany({
      where: { instructorId, ...(kind ? { kind } : {}) },
      orderBy: { createdAt: 'desc' }, take: 200,
    })
    return json({ templates })
  } catch (e) { return failure(e) }
}

export async function POST(req: Request) {
  try {
    const instructorId = await requireInstructor()
    const { kind, name, data } = await input(req, templateSaveInput)
    const template = await prisma.template.create({ data: { instructorId, kind, name, data: data as any } })
    return json({ template }, 201)
  } catch (e) { return failure(e) }
}
