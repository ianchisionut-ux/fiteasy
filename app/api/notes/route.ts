import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { actor, failure, input, json } from '@/lib/client-auth'

const mutation = z.discriminatedUnion('action', [
  z.object({ action: z.literal('create'), title: z.string().trim().min(1).max(150), content: z.string().trim().min(1).max(8000), pinned: z.boolean() }).strict(),
  z.object({ action: z.literal('update'), id: z.string().min(1), title: z.string().trim().min(1).max(150), content: z.string().trim().min(1).max(8000), pinned: z.boolean() }).strict(),
  z.object({ action: z.literal('delete'), id: z.string().min(1) }).strict(),
])

export async function GET(req: Request) {
  try {
    const { client } = await actor(req)
    const notes = await prisma.clientNote.findMany({ where: { clientId: client.id }, orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }] })
    return json({ notes })
  } catch (e) { return failure(e) }
}

export async function POST(req: Request) {
  try {
    const { client, owner } = await actor(req)
    if (!owner) return json({ error: 'Doar instructorul poate modifica notele.' }, 403)
    const body = await input(req, mutation)
    if (body.action === 'delete') { await prisma.clientNote.deleteMany({ where: { id: body.id, clientId: client.id } }); return json({ ok: true }) }
    if (body.action === 'create') return json({ note: await prisma.clientNote.create({ data: { clientId: client.id, title: body.title, content: body.content, pinned: body.pinned } }) }, 201)
    const note = await prisma.clientNote.findFirst({ where: { id: body.id, clientId: client.id } })
    if (!note) return json({ error: 'Nota nu există.' }, 404)
    return json({ note: await prisma.clientNote.update({ where: { id: note.id }, data: { title: body.title, content: body.content, pinned: body.pinned } }) })
  } catch (e) { return failure(e) }
}
