import { Apple, CheckCircle2, Dumbbell, MessageSquare, TrendingUp } from 'lucide-react'
import ClientReminders from './client-reminders'

type Entry = { id: string; kind: string; date: string; time: string; title: string; completed: boolean; feedback: string }
export default function ClientOverview({ entries, clientName, query, onOpen }: { entries: Entry[]; clientName: string; query: string; onOpen: (tab: string) => void }) {
  const workouts = entries.filter(entry => entry.kind === 'WORKOUT')
  const completed = workouts.filter(entry => entry.completed).length
  const compliance = workouts.length ? Math.round(completed / workouts.length * 100) : 0
  const tasks = entries.length
  const today = new Date().toISOString().slice(0, 10)
  const todayEntries = entries.filter(entry => entry.date === today)
  return <div className="grid xl:grid-cols-[minmax(0,1.4fr)_340px] gap-5">
    <div className="space-y-5">
      <div className="grid md:grid-cols-2 gap-5"><RingMetric value={compliance} title="Respectare antrenamente" detail={`${completed} / ${workouts.length} antrenamente`} /><RingMetric value={tasks ? Math.min(100, tasks * 10) : 0} title="Activități planificate" detail={`${tasks} sarcini în perioada curentă`} /></div>
      <section className="card p-6 min-h-[330px]">
        <div className="flex items-center justify-between"><div><p className="page-kicker">ACTIVITATE CLIENT</p><h2 className="font-semibold mt-1">Rezumat pentru {clientName}</h2></div><TrendingUp size={19} className="text-[#2bb8ad]"/></div>
        <div className="mt-7 space-y-3">{entries.slice(0, 8).map(entry => <div key={entry.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0"><div className={`activity-icon ${entry.kind === 'NUTRITION' ? 'activity-icon-blue' : ''}`}>{entry.kind === 'NUTRITION' ? <Apple size={16}/> : <Dumbbell size={16}/>}</div><div className="flex-1"><p className="text-sm font-medium">{entry.title}</p><p className="text-xs text-gray-400">{entry.date} · {entry.time}</p></div>{entry.completed && <CheckCircle2 size={17} className="text-[#23ad87]"/>}</div>)}{!entries.length && <p className="text-sm text-gray-400 py-12 text-center">Nu există încă activitate în perioada curentă.</p>}</div>
      </section>
    </div>
    <aside className="space-y-5">
      <ClientReminders query={query}/>
      <section className="card p-5"><p className="text-xs text-gray-400">ASTĂZI</p><h2 className="text-xl font-semibold mt-1">{new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })}</h2><div className="mt-5 space-y-2">{todayEntries.map(entry => <button key={entry.id} onClick={() => onOpen(entry.kind)} className="w-full text-left rounded bg-[#f4faf9] p-3"><p className="text-sm font-medium">{entry.title}</p><p className="text-xs text-gray-400 mt-1">{entry.time}</p></button>)}{!todayEntries.length && <p className="text-sm text-gray-400">Nimic planificat astăzi.</p>}</div></section>
      <section className="card p-5"><h2 className="font-semibold">Acțiuni rapide</h2><button onClick={() => onOpen('WORKOUT')} className="overview-action"><Dumbbell size={16}/>Deschide calendarul</button><button onClick={() => onOpen('NUTRITION')} className="overview-action"><Apple size={16}/>Vezi nutriția</button><button onClick={() => onOpen('NOTES')} className="overview-action"><MessageSquare size={16}/>Adaugă o notă</button></section>
    </aside>
  </div>
}

function RingMetric({ value, title, detail }: { value: number; title: string; detail: string }) {
  const circumference = 2 * Math.PI * 29
  return <div className="card p-5 flex items-center gap-4"><svg width="76" height="76" viewBox="0 0 76 76"><circle cx="38" cy="38" r="29" fill="none" stroke="#edf2f1" strokeWidth="7"/><circle cx="38" cy="38" r="29" fill="none" stroke="#2bb8ad" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${circumference * value / 100} ${circumference}`} transform="rotate(-90 38 38)"/><text x="38" y="42" textAnchor="middle" fontSize="14" fontWeight="700">{value}%</text></svg><div><p className="font-semibold">{title}</p><p className="text-sm text-gray-400 mt-1">{detail}</p></div></div>
}
