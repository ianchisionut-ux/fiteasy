'use client'
import { useEffect, useState } from 'react'
import { BellRing } from 'lucide-react'
type Reminder = { id: string; title: string; details: string; time: string; days: string }
export default function ClientReminders({ query }: { query: string }) {
  const [items, setItems] = useState<Reminder[]>([])
  useEffect(() => { fetch(`/api/reminders?${query}`, { cache: 'no-store' }).then(r => r.json()).then(body => setItems(body.reminders ?? [])) }, [query])
  const today = new Date().getDay().toString()
  const visible = items.filter(item => item.days.split(',').includes(today))
  return <section className="card p-5"><div className="flex items-center justify-between"><h2 className="font-semibold">De făcut astăzi</h2><BellRing size={17} className="text-[#2bb8ad]"/></div><div className="mt-4 space-y-2">{visible.map(item => <div key={item.id} className="rounded bg-[#f3faf8] p-3"><div className="flex justify-between gap-3"><p className="text-sm font-medium">{item.title}</p><span className="text-xs text-gray-400">{item.time}</span></div>{item.details && <p className="text-xs text-gray-500 mt-1">{item.details}</p>}</div>)}{!visible.length && <p className="text-sm text-gray-400">Niciun reminder pentru astăzi.</p>}</div></section>
}
