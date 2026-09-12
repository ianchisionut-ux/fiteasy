'use client'

import { useEffect, useState } from 'react'
import { Users, MessageCircle, Plus, Sparkles, Zap } from 'lucide-react'

type TodayEntry = { id: string; time: string; title: string; kind: string; client: { id: string; name: string } }
type RecentMessage = { id: string; text: string; createdAt: string; client: { id: string; name: string } }
type Summary = { totalClients: number; activeClients: number; todayEntries: TodayEntry[]; recentMessages: RecentMessage[]; weeklyCompletion: { date: string; rate: number }[] }

export default function DashboardHome({ instructorName, onSelectClient, onNewClient, onDemoData }: { instructorName: string; onSelectClient: (id: string) => void; onNewClient: () => void; onDemoData: () => void }) {
  const [data, setData] = useState<Summary | null>(null)

  useEffect(() => { fetch('/api/dashboard-summary').then(r => r.json()).then(setData) }, [])

  if (!data) return <div className="card p-8 text-center text-sm text-gray-400">Se încarcă…</div>

  const avgRate = data.weeklyCompletion.length ? Math.round(data.weeklyCompletion.reduce((s, d) => s + d.rate, 0) / data.weeklyCompletion.length) : 0
  const bestDay = [...data.weeklyCompletion].sort((a, b) => b.rate - a.rate)[0]
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Bine ai revenit, {instructorName.split(' ')[0]} 👋</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4 flex items-center justify-between">
          <div><p className="text-xs text-gray-500">Clienți activi</p><p className="text-2xl font-semibold mt-1">{data.activeClients}</p></div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-soft)' }}><Users size={18} style={{ color: 'var(--accent)' }} /></div>
        </div>
        <div className="card p-4 flex items-center justify-between">
          <div><p className="text-xs text-gray-500">Mesaje noi</p><p className="text-2xl font-semibold mt-1">{data.recentMessages.length}</p></div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-soft)' }}><MessageCircle size={18} style={{ color: 'var(--accent)' }} /></div>
        </div>
      </div>

      <div className="card p-4">
        <h2 className="text-sm font-semibold mb-3">Evoluție completare planuri — ultimele 7 zile</h2>
        {(() => {
          const w = 300, h = 90, pad = 6
          const points = data.weeklyCompletion.map((d, i) => {
            const x = (i / 6) * w
            const y = pad + (1 - d.rate / 100) * (h - 2 * pad)
            return `${x},${y}`
          }).join(' ')
          return (
            <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
              <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
              {data.weeklyCompletion.map((d, i) => <circle key={i} cx={(i / 6) * w} cy={pad + (1 - d.rate / 100) * (h - 2 * pad)} r="3" fill="var(--accent)" />)}
            </svg>
          )
        })()}
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">{days.map((d, i) => <span key={i}>{d}</span>)}</div>
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-100 text-center">
          <div><p className="text-xs text-gray-500">Rată medie</p><p className="text-base font-semibold mt-0.5">{avgRate}%</p></div>
          <div><p className="text-xs text-gray-500">Clienți activi</p><p className="text-base font-semibold mt-0.5">{data.activeClients}/{data.totalClients}</p></div>
          <div><p className="text-xs text-gray-500">Cea mai bună zi</p><p className="text-base font-semibold mt-0.5">{bestDay ? `${bestDay.rate}%` : '—'}</p></div>
        </div>
      </div>

      <div className="card p-4">
        <h2 className="text-sm font-semibold mb-3">Astăzi</h2>
        {data.todayEntries.length === 0 && <p className="text-sm text-gray-400">Nimic planificat azi.</p>}
        <div className="space-y-2">
          {data.todayEntries.map(e => (
            <button key={e.id} onClick={() => onSelectClient(e.client.id)} className="w-full flex items-center gap-3 text-left hover:bg-gray-50 rounded-lg p-1 -m-1">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: e.kind === 'WORKOUT' ? 'var(--accent-soft)' : '#DBEAFE' }}>
                <Zap size={15} style={{ color: e.kind === 'WORKOUT' ? 'var(--accent)' : '#3b82f6' }} />
              </div>
              <div className="min-w-0"><p className="text-sm font-medium truncate">{e.time} · {e.title}</p><p className="text-xs text-gray-500 truncate">{e.client.name}</p></div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card p-4">
          <h2 className="text-sm font-semibold mb-3">Acțiuni rapide</h2>
          <div className="space-y-1">
            <button onClick={onNewClient} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 text-left">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent-soft)' }}><Plus size={16} style={{ color: 'var(--accent)' }} /></div>
              <div><p className="text-sm font-medium">Client nou</p><p className="text-xs text-gray-500">Adaugă un client în listă</p></div>
            </button>
            {data.totalClients === 0 && (
              <button onClick={onDemoData} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 text-left">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent-soft)' }}><Sparkles size={16} style={{ color: 'var(--accent)' }} /></div>
                <div><p className="text-sm font-medium">Date demo</p><p className="text-xs text-gray-500">3 clienți de test, cu tot ce trebuie</p></div>
              </button>
            )}
          </div>
        </div>
        <div className="card p-4">
          <h2 className="text-sm font-semibold mb-3">Mesaje recente</h2>
          {data.recentMessages.length === 0 && <p className="text-sm text-gray-400">Niciun mesaj încă.</p>}
          <div className="space-y-2">
            {data.recentMessages.map(m => (
              <button key={m.id} onClick={() => onSelectClient(m.client.id)} className="w-full flex items-center gap-2.5 text-left">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-medium text-white flex-shrink-0" style={{ background: 'var(--accent)' }}>
                  {m.client.name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div className="min-w-0"><p className="text-sm font-medium truncate">{m.client.name}</p><p className="text-xs text-gray-500 truncate">{m.text}</p></div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
