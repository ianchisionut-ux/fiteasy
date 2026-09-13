'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { CalendarDays, MessageCircle, Plus, Sparkles, Users, Zap } from 'lucide-react'

type TodayEntry = { id: string; time: string; title: string; kind: string; client: { id: string; name: string } }
type RecentMessage = { id: string; text: string; createdAt: string; client: { id: string; name: string } }
type Summary = { totalClients: number; activeClients: number; todayEntries: TodayEntry[]; recentMessages: RecentMessage[]; weeklyCompletion: { date: string; rate: number }[] }

export default function DashboardHome({ instructorName, onSelectClient, onNewClient, onDemoData }: { instructorName: string; onSelectClient: (id: string) => void; onNewClient: () => void; onDemoData: () => void }) {
  const [data, setData] = useState<Summary | null>(null)
  useEffect(() => { fetch('/api/dashboard-summary').then(r => r.json()).then(setData) }, [])
  if (!data) return <div className="card p-10 text-center text-sm text-gray-400">Se încarcă panoul…</div>

  const avgRate = data.weeklyCompletion.length ? Math.round(data.weeklyCompletion.reduce((sum, day) => sum + day.rate, 0) / data.weeklyCompletion.length) : 0
  const taskRate = data.todayEntries.length ? Math.min(100, Math.round((data.todayEntries.length / Math.max(data.activeClients, 1)) * 100)) : 0

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-end justify-between">
        <div><p className="page-kicker">PANOU GENERAL</p><h1 className="text-2xl font-semibold mt-1">Bine ai revenit, {instructorName.split(' ')[0] || 'Coach'}</h1><p className="text-sm text-gray-500 mt-1">O imagine clară a activității clienților tăi.</p></div>
        <button onClick={onNewClient} className="btn-primary flex items-center gap-2"><Plus size={16} />Adaugă client</button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <MetricCard value={avgRate} title="Respectare planuri" detail={`${data.activeClients} din ${data.totalClients} clienți activi`} icon={<Users size={17} />} />
        <MetricCard value={taskRate} title="Activitate astăzi" detail={`${data.todayEntries.length} activități planificate`} icon={<CalendarDays size={17} />} />
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,.75fr)] gap-5">
        <section className="card p-6 min-h-[390px]">
          <div className="flex items-center justify-between mb-8"><div><p className="text-xs text-gray-400 uppercase tracking-wider">Activitate</p><h2 className="font-semibold mt-1">Evoluție completare planuri</h2></div><span className="text-xs border border-gray-200 rounded px-3 py-2">Ultimele 7 zile</span></div>
          <CompletionChart points={data.weeklyCompletion} />
          <div className="grid grid-cols-3 gap-4 mt-7 pt-5 border-t border-gray-100">
            <SmallStat label="Rată medie" value={`${avgRate}%`} />
            <SmallStat label="Clienți activi" value={`${data.activeClients}/${data.totalClients}`} />
            <SmallStat label="Mesaje recente" value={String(data.recentMessages.length)} />
          </div>
        </section>

        <aside className="space-y-5">
          <section className="card p-5">
            <div className="flex items-center justify-between mb-4"><h2 className="font-semibold">Astăzi</h2><span className="text-xs text-gray-400">{new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })}</span></div>
            {data.todayEntries.length === 0 && <p className="text-sm text-gray-400 py-5">Nimic planificat azi.</p>}
            <div className="space-y-1">
              {data.todayEntries.slice(0, 5).map(entry => (
                <button key={entry.id} onClick={() => onSelectClient(entry.client.id)} className="w-full flex items-center gap-3 text-left hover:bg-[#f5faf9] rounded p-2 -mx-2">
                  <div className={`activity-icon ${entry.kind === 'NUTRITION' ? 'activity-icon-blue' : ''}`}><Zap size={15} /></div>
                  <div className="min-w-0 flex-1"><p className="text-sm font-medium truncate">{entry.title}</p><p className="text-xs text-gray-400 truncate">{entry.time} · {entry.client.name}</p></div>
                  <span className="text-gray-300">›</span>
                </button>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <div className="flex items-center justify-between mb-4"><h2 className="font-semibold">Mesaje recente</h2><MessageCircle size={17} className="text-gray-400" /></div>
            {data.recentMessages.length === 0 && <p className="text-sm text-gray-400">Niciun mesaj încă.</p>}
            <div className="space-y-3">
              {data.recentMessages.slice(0, 3).map(message => (
                <button key={message.id} onClick={() => onSelectClient(message.client.id)} className="w-full flex items-center gap-3 text-left">
                  <Avatar name={message.client.name} />
                  <div className="min-w-0"><p className="text-sm font-medium truncate">{message.client.name}</p><p className="text-xs text-gray-400 truncate">{message.text}</p></div>
                </button>
              ))}
            </div>
          </section>

          {data.totalClients === 0 && <button onClick={onDemoData} className="btn-secondary w-full flex items-center justify-center gap-2"><Sparkles size={15} />Adaugă date demo</button>}
        </aside>
      </div>
    </div>
  )
}

function MetricCard({ value, title, detail, icon }: { value: number; title: string; detail: string; icon: ReactNode }) {
  const r = 30
  const c = 2 * Math.PI * r
  return <div className="card p-5 flex items-center gap-5">
    <svg width="78" height="78" viewBox="0 0 78 78" className="shrink-0">
      <circle cx="39" cy="39" r={r} fill="none" stroke="#edf2f1" strokeWidth="7" />
      <circle cx="39" cy="39" r={r} fill="none" stroke="var(--accent)" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${c * value / 100} ${c}`} transform="rotate(-90 39 39)" />
      <text x="39" y="43" textAnchor="middle" fontSize="15" fontWeight="700" fill="#1d2826">{value}%</text>
    </svg>
    <div className="flex-1"><div className="flex items-center gap-2 text-gray-400">{icon}<span className="text-[11px] uppercase tracking-wider">Performanță</span></div><p className="font-semibold mt-2">{title}</p><p className="text-sm text-gray-400 mt-0.5">{detail}</p></div>
  </div>
}

function CompletionChart({ points }: { points: { date: string; rate: number }[] }) {
  const safe = points.length ? points : Array.from({ length: 7 }, (_, i) => ({ date: String(i), rate: 0 }))
  const w = 700, h = 210, pad = 18
  const coords = safe.map((point, i) => ({ x: pad + (i / Math.max(safe.length - 1, 1)) * (w - pad * 2), y: pad + (1 - point.rate / 100) * (h - pad * 2), ...point }))
  const line = coords.map(p => `${p.x},${p.y}`).join(' ')
  const area = `${pad},${h - pad} ${line} ${w - pad},${h - pad}`
  return <div>
    <svg width="100%" height="230" viewBox={`0 0 ${w} ${h + 20}`} preserveAspectRatio="none">
      {[0, 25, 50, 75, 100].map(value => <line key={value} x1={pad} x2={w - pad} y1={pad + (1 - value / 100) * (h - pad * 2)} y2={pad + (1 - value / 100) * (h - pad * 2)} stroke="#edf1f0" strokeDasharray="5 8" />)}
      <defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2bb8ad" stopOpacity=".2"/><stop offset="1" stopColor="#2bb8ad" stopOpacity="0"/></linearGradient></defs>
      <polygon points={area} fill="url(#chartFill)" />
      <polyline points={line} fill="none" stroke="var(--accent)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      {coords.map((point, i) => <circle key={i} cx={point.x} cy={point.y} r="4" fill="white" stroke="var(--accent)" strokeWidth="2" vectorEffect="non-scaling-stroke" />)}
    </svg>
    <div className="flex justify-between text-[11px] text-gray-400 px-2">{safe.map((point, i) => <span key={i}>{new Date(`${point.date}T12:00:00`).toLocaleDateString('ro-RO', { weekday: 'short' })}</span>)}</div>
  </div>
}

function SmallStat({ label, value }: { label: string; value: string }) { return <div><p className="text-xs text-gray-400">{label}</p><p className="text-xl font-semibold mt-1">{value}</p></div> }
function Avatar({ name }: { name: string }) { return <div className="w-9 h-9 rounded-full bg-[#dff7f3] text-[#168b80] flex items-center justify-center text-[11px] font-semibold shrink-0">{name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()}</div> }
