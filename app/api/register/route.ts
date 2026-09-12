import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { json, failure } from '@/lib/client-auth'
import { registerInput } from '@/lib/validation'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    if (!rateLimit(`register:${ip}`, 5, 60 * 60_000).allowed) {
      return json({ error: 'Prea multe încercări. Așteaptă puțin și încearcă din nou.' }, 429)
    }

    const body = await req.json().catch(() => null)
    const parsed = registerInput.safeParse(body)
    if (!parsed.success) return json({ error: 'Verifică datele completate.' }, 400)
    const { name, email, password } = parsed.data
    const normalizedEmail = email.toLowerCase().trim()

    const existing = await prisma.instructor.findUnique({ where: { email: normalizedEmail } })
    if (existing) return json({ error: 'Există deja un cont cu acest email.' }, 409)

    const hashed = await bcrypt.hash(password, 10)
    await prisma.instructor.create({ data: { name, email: normalizedEmail, password: hashed } })
    return json({ ok: true }, 201)
  } catch (e) { return failure(e) }
}
