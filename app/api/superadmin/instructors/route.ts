import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

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

const toggleInput = z.object({ instructorId: z.string().min(1), active: z.boolean() }).strict()

export async function POST(req: Request) {
  const admin = await requireSuperAdmin()
  if (!admin) return NextResponse.json({ error: 'Acces interzis.' }, { status: 403 })
  const parsed = toggleInput.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Date invalide.' }, { status: 400 })
  if (parsed.data.instructorId === admin) return NextResponse.json({ error: 'Nu-ți poți dezactiva propriul cont.' }, { status: 400 })
  await prisma.instructor.update({ where: { id: parsed.data.instructorId }, data: { active: parsed.data.active } })
  return NextResponse.json({ ok: true })
}
