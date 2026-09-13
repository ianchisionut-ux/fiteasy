import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

async function requireSuperAdmin() {
  const session = await auth()
  if (!(session as any)?.isSuperAdmin) return null
  return (session as any).instructorId as string
}

export async function GET() {
  const admin = await requireSuperAdmin()
  if (!admin) return NextResponse.json({ error: 'Acces interzis.' }, { status: 403 })
  const instructors = await prisma.instructor.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, active: true, isSuperAdmin: true, createdAt: true, _count: { select: { clients: true } } },
  })
  return NextResponse.json({ instructors })
}

const mutationInput = z.discriminatedUnion('action', [
  z.object({ action: z.literal('toggle'), instructorId: z.string().min(1), active: z.boolean() }).strict(),
  z.object({ action: z.literal('create'), name: z.string().trim().min(1).max(150), email: z.string().email().max(200), password: z.string().min(8).max(200) }).strict(),
  z.object({ action: z.literal('update'), instructorId: z.string().min(1), name: z.string().trim().min(1).max(150), email: z.string().email().max(200), password: z.string().min(8).max(200).optional() }).strict(),
])

export async function POST(req: Request) {
  const admin = await requireSuperAdmin()
  if (!admin) return NextResponse.json({ error: 'Acces interzis.' }, { status: 403 })
  const parsed = mutationInput.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Date invalide.' }, { status: 400 })
  const body = parsed.data
  if (body.action === 'create') {
    const exists = await prisma.instructor.findUnique({ where: { email: body.email.toLowerCase() } })
    if (exists) return NextResponse.json({ error: 'Există deja un cont cu acest email.' }, { status: 409 })
    const instructor = await prisma.instructor.create({ data: { name: body.name, email: body.email.toLowerCase(), password: await bcrypt.hash(body.password, 12) }, select: { id: true, name: true, email: true, active: true } })
    return NextResponse.json({ instructor }, { status: 201 })
  }
  if (body.action === 'update') {
    const target = await prisma.instructor.findUnique({ where: { id: body.instructorId } })
    if (!target) return NextResponse.json({ error: 'Administrator inexistent.' }, { status: 404 })
    const data: { name: string; email: string; password?: string } = { name: body.name, email: body.email.toLowerCase() }
    if (body.password) data.password = await bcrypt.hash(body.password, 12)
    await prisma.instructor.update({ where: { id: target.id }, data })
    return NextResponse.json({ ok: true })
  }
  if (body.instructorId === admin) return NextResponse.json({ error: 'Nu-ți poți dezactiva propriul cont.' }, { status: 400 })
  await prisma.instructor.update({ where: { id: body.instructorId }, data: { active: body.active } })
  return NextResponse.json({ ok: true })
}
