import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const input = z.object({
  secret: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().trim().min(1).max(150),
}).strict()

export async function POST(req: Request) {
  try {
    const setupSecret = process.env.SETUP_SECRET
    if (!setupSecret) return NextResponse.json({ error: 'SETUP_SECRET nu este configurat.' }, { status: 500 })

    const parsed = input.safeParse(await req.json().catch(() => null))
    if (!parsed.success) return NextResponse.json({ error: 'Date invalide.' }, { status: 400 })
    if (parsed.data.secret !== setupSecret) return NextResponse.json({ error: 'Secret greșit.' }, { status: 403 })

    const existing = await prisma.instructor.count()
    if (existing > 0) return NextResponse.json({ error: 'Contul de instructor există deja.' }, { status: 409 })

    const password = await bcrypt.hash(parsed.data.password, 10)
    await prisma.instructor.create({ data: { email: parsed.data.email.toLowerCase().trim(), password, name: parsed.data.name } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    // Temporar: trimitem mesajul exact în răspuns ca să putem diagnostica.
    // De scos după ce merge — nu trebuie să rămână în producție.
    const message = e instanceof Error ? `${e.name}: ${e.message}`
      : e?.message ? `${e?.type ?? 'ErrorEvent'}: ${e.message}`
      : e?.error ? String(e.error)
      : JSON.stringify(e, Object.getOwnPropertyNames(e ?? {}))
    return NextResponse.json({ error: 'A apărut o eroare la crearea contului.', debug: message }, { status: 500 })
  }
}
