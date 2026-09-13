import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import { MessageSquare } from 'lucide-react'

export default async function MessagesPage() {
  const session = await auth()
  const instructorId = (session as any).instructorId as string
  const clients = await prisma.client.findMany({ where: { instructorId }, orderBy: { name: 'asc' }, select: { id: true, name: true, messages: { orderBy: { createdAt: 'desc' }, take: 1, select: { text: true, createdAt: true, sender: true } } } })
  return <div className="space-y-5"><div><p className="page-kicker">COMUNICARE</p><h1 className="text-2xl font-semibold mt-1">Mesaje</h1><p className="text-sm text-gray-500 mt-1">Toate conversațiile cu clienții.</p></div><div className="card divide-y divide-gray-100">{clients.map(client => { const last = client.messages[0]; return <Link key={client.id} href={`/dashboard?client=${client.id}&tab=MESSAGES`} className="flex items-center gap-4 p-4 hover:bg-[#f7fbfa]"><div className="activity-icon"><MessageSquare size={17}/></div><div className="flex-1 min-w-0"><p className="text-sm font-semibold">{client.name}</p><p className="text-xs text-gray-400 truncate mt-1">{last?.text ?? 'Începe conversația'}</p></div>{last && <span className="text-xs text-gray-400">{new Date(last.createdAt).toLocaleDateString('ro-RO')}</span>}<span className="text-gray-300">›</span></Link>})}{!clients.length && <p className="text-sm text-gray-400 text-center py-12">Niciun client încă.</p>}</div></div>
}
