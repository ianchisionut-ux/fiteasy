import { createHash, randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ZodError, type ZodType } from 'zod'

export const SESSION_COOKIE = 'fiteasy-session'
export const TIMEZONE = 'Europe/Bucharest'
export const hashToken = (value: string) => createHash('sha256').update(value).digest('hex')
export const newToken = () => randomBytes(32).toString('hex')

export class ActorError extends Error {
  constructor(public status: number, message: string) { super(message) }
}

export async function requireInstructor() {
  const session = await auth()
  const instructorId = (session as any)?.instructorId as string | undefined
  if (!instructorId) throw new ActorError(401, 'Autentifică-te ca instructor.')
  return instructorId
}

export async function portalClient() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  if (!token || !/^[a-f0-9]{64}$/.test(token)) throw new ActorError(401, 'Solicită instructorului un link de acces nou.')
  const session = await prisma.clientSession.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { expiresAt: true, client: { select: { id: true, instructorId: true, active: true, name: true } } },
  })
  if (!session || session.expiresAt <= new Date() || !session.client.active) {
    throw new ActorError(401, 'Accesul a expirat sau a fost revocat. Contactează instructorul.')
  }
  return session.client
}

// Rezolvă cine face cererea: clientul din cookie-ul portalului, sau instructorul
// autentificat care gestionează un anumit client (?mode=instructor&clientId=...).
export async function actor(req: Request) {
  const owner = new URL(req.url).searchParams.get('mode') === 'instructor'
  if (!owner) {
    const client = await portalClient()
    return { client, owner: false }
  }
  const instructorId = await requireInstructor()
  const id = new URL(req.url).searchParams.get('clientId') ?? ''
  const client = await prisma.client.findFirst({
    where: { id, instructorId },
    select: { id: true, instructorId: true, active: true, name: true },
  })
  if (!client) throw new ActorError(404, 'Client inexistent.')
  return { client, owner: true }
}

export function requireSameOrigin(req: Request) {
  if (req.headers.get('origin') !== new URL(req.url).origin) throw new ActorError(403, 'Cerere nepermisă.')
}

export async function input<T>(req: Request, schema: ZodType<T>): Promise<T> {
  requireSameOrigin(req)
  if (!req.headers.get('content-type')?.includes('application/json')) throw new ActorError(415, 'Format invalid.')
  const reader = req.body?.getReader()
  if (!reader) throw new ActorError(400, 'Lipsesc datele.')
  const chunks: Uint8Array[] = []; let size = 0
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    size += value.length
    if (size > 32768) { await reader.cancel(); throw new ActorError(413, 'Conținut prea mare.') }
    chunks.push(value)
  }
  try { return schema.parse(JSON.parse(Buffer.concat(chunks).toString('utf8'))) }
  catch (e) { if (e instanceof ZodError) throw e; throw new ActorError(400, 'Date invalide.') }
}

export function json(value: unknown, status = 200) {
  return NextResponse.json(value, { status, headers: { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' } })
}

export function failure(error: unknown) {
  if (error instanceof ActorError) return json({ error: error.message }, error.status)
  if (error instanceof ZodError) return json({ error: 'Verifică datele completate.' }, 400)
  // Nu logăm niciodată detalii de nutriție, mesaje, sesiuni sau token-uri de invitație.
  console.error('Request failed', error instanceof Error ? error.name : 'unknown')
  return json({ error: 'Cererea nu a putut fi finalizată. Încearcă din nou.' }, 500)
}
