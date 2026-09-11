'use client'

import { useEffect, useState } from 'react'
import { addDays, format, startOfWeek } from 'date-fns'
import { Check, Circle, MessageCircle, Pencil, Trash2, Plus, Video, ChevronLeft, ChevronRight, BookmarkPlus } from 'lucide-react'
import { MUSCLE_GROUPS, EXERCISES } from '@/lib/exercises'
import ProgressTab from './progress-tab'
import TemplatePicker from './template-picker'
import MonthOverview from './month-overview'

type Entry = { id: string; kind: string; date: string; time: string; title: string; details: string; muscleGroup: string | null; protein: number | null; carbs: number | null; fat: number | null; calories: number | null; completed: boolean; feedback: string; coachNote: string; version: number }
type Message = { id: string; text: string; sender: string; createdAt: string }
type ClientOption = { id: string; name: string; phone: string | null; active: boolean; dailyProteinTarget: number | null; dailyCarbsTarget: number | null; dailyFatTarget: number | null; dailyCaloriesTarget: number | null }

const emptyPlan = { kind: 'WORKOUT', date: '', time: '09:00', title: '', details: '', muscleGroup: '', protein: '', carbs: '', fat: '', calories: '' }

async function api(url: string, method = 'GET', body?: unknown, signal?: AbortSignal) {
  const response = await fetch(url, { method, signal, cache: 'no-store', headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined })
  const isJson = response.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await response.json().catch(() => null) : null
  if (!response.ok) throw new Error(data?.error || `Serverul nu a putut finaliza cererea (HTTP ${response.status}).`)
  return data ?? {}
}

const WEEKDAYS = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum']

export default function Workspace({ owner = false }: { owner?: boolean }) {
  const [clients, setClients] = useState<ClientOption[]>([])
  const [clientId, setClientId] = useState('')
  const [clientName, setClientName] = useState('')
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [tab, setTab] = useState('WORKOUT')
  const [entries, setEntries] = useState<Entry[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [draft, setDraft] = useState('')
  const [editing, setEditing] = useState<Entry | null>(null)
  const [plan, setPlan] = useState(emptyPlan)
  const [editorOpen, setEditorOpen] = useState(false)
  const [progress, setProgress] = useState<Entry | null>(null)
  const [newClientOpen, setNewClientOpen] = useState(false)
  const [newClient, setNewClient] = useState({ name: '', phone: '' })
  const [invite, setInvite] = useState('')
  const [editingTargets, setEditingTargets] = useState(false)
  const [savingTemplate, setSavingTemplate] = useState(false)

  const week = startOfWeek(new Date(`${selectedDate}T12:00:00`), { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => format(addDays(week, i), 'yyyy-MM-dd'))
  const from = weekDays[0], to = weekDays[6]
  const query = owner ? `mode=instructor&clientId=${encodeURIComponent(clientId)}` : 'mode=client'

  async function action(fn: () => Promise<void>) {
    setBusy(true); setError('')
    try { await fn() } catch (e) { setError(e instanceof Error ? e.message : 'A apărut o eroare.') }
    finally { setBusy(false) }
  }

  useEffect(() => {
    if (!owner) return
    api('/api/clients').then(d => setClients(d.clients)).catch(e => setError(e.message))
  }, [owner])

  useEffect(() => {
    if (owner && !clientId) { setEntries([]); setMessages([]); return }
    const controller = new AbortController()
    async function load() {
      try {
        const data = await api(`/api/entries?${query}&from=${from}&to=${to}`, 'GET', undefined, controller.signal)
        if (controller.signal.aborted) return
        setEntries(data.entries); setClientName(data.clientName || '')
        if (tab === 'MESSAGES') {
          const chat = await api(`/api/messages?${query}`, 'GET', undefined, controller.signal)
          if (controller.signal.aborted) return
          setMessages(chat.messages); setHasMore(chat.hasMore)
        }
      } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Sincronizare eșuată.') }
    }
    void load()
    const timer = setInterval(load, 20000)
    return () => { controller.abort(); clearInterval(timer) }
  }, [owner, clientId, from, to, tab])

  const dayEntries = (day: string) => entries.filter(e => e.date === day && e.kind === tab)
  const selectedEntries = dayEntries(selectedDate)
  const selectedLabel = new Date(`${selectedDate}T12:00:00`).toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Bucharest' })

  if (owner && !clientId) {
    return (
      <div className="space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Clienți</h1>
          <button className="btn-primary flex items-center gap-1.5" onClick={() => setNewClientOpen(true)}><Plus size={16} />Client nou</button>
        </div>
        <MonthOverview onSelectClient={setClientId} />
        {newClientOpen && <form className="card p-4 space-y-3" onSubmit={e => {
          e.preventDefault(); void action(async () => {
            const d = await api('/api/clients', 'POST', { action: 'create', ...newClient })
            setClients(c => [...c, d.client]); setNewClientOpen(false); setNewClient({ name: '', phone: '' })
          })
        }}>
          <label className="block text-sm">Nume<input required className="field mt-1" value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} placeholder="Andreea Popescu" /></label>
          <label className="block text-sm">Telefon (opțional)<input className="field mt-1" value={newClient.phone} onChange={e => setNewClient({ ...newClient, phone: e.target.value })} placeholder="07xx xxx xxx" /></label>
          <div className="flex gap-2"><button className="btn-primary" disabled={busy}>Salvează</button><button type="button" className="btn-secondary" onClick={() => setNewClientOpen(false)}>Renunță</button></div>
        </form>}
        <div className="card divide-y divide-gray-100">
          {clients.length === 0 && <p className="p-4 text-sm text-gray-500">Niciun client încă. Adaugă primul client ca să începi.</p>}
          {clients.map(c => (
            <button key={c.id} onClick={() => setClientId(c.id)} className="w-full flex items-center gap-3 p-3 text-left hover:bg-[var(--accent-soft)] transition">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0" style={{ background: 'var(--accent)' }}>
                {c.name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{c.name}</p>{!c.active && <p className="text-xs text-amber-600">Acces inactiv</p>}</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {owner && (
        <div className="flex items-center justify-between">
          <button onClick={() => { setClientId(''); setInvite('') }} className="text-sm text-gray-500 hover:text-gray-900">← Toți clienții</button>
          <h1 className="text-base font-semibold">{clientName}</h1>
          <button className="btn-secondary text-xs" disabled={busy} onClick={() => action(async () => {
            const d = await api('/api/clients', 'POST', { action: 'invite', clientId }); setInvite(d.inviteUrl)
          })}>Link de acces</button>
        </div>
      )}
      {invite && <div className="card p-3 text-xs space-y-2 bg-[var(--accent-soft)] border-none">
        <p>Trimite privat acest link clientului. Valabil 24h, o singură utilizare.</p>
        <input readOnly className="field text-xs" value={invite} onFocus={e => e.target.select()} />
      </div>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <nav className="flex gap-2 flex-wrap">
        {[['WORKOUT', 'Antrenamente'], ['NUTRITION', 'Nutriție'], ['PROGRES', 'Progres'], ['MESSAGES', 'Mesaje']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className="px-4 py-2 rounded-full text-sm font-medium transition" style={tab === key ? { background: 'var(--accent)', color: 'white' } : { background: 'white', border: '1px solid #E5E7EB' }}>{label}</button>
        ))}
      </nav>

      {tab === 'PROGRES' && <ProgressTab owner={owner} query={query} />}

      {(tab === 'WORKOUT' || tab === 'NUTRITION') && <>
        <div className="flex items-center gap-1">
          <button aria-label="Săptămâna precedentă" onClick={() => setSelectedDate(format(addDays(week, -7), 'yyyy-MM-dd'))} className="p-1.5 rounded-lg hover:bg-gray-100"><ChevronLeft size={16} /></button>
          <div className="flex-1 grid grid-cols-7 gap-1.5">
            {weekDays.map((day, i) => {
              const dayHasEntries = dayEntries(day)
              const allDone = dayHasEntries.length > 0 && dayHasEntries.every(e => e.completed)
              const isSelected = day === selectedDate
              return (
                <button key={day} onClick={() => setSelectedDate(day)} className="rounded-xl py-2 text-center transition" style={isSelected ? { background: 'var(--accent)', color: 'white' } : {}}>
                  <div className="text-[11px]" style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : '#9CA3AF' }}>{WEEKDAYS[i]}</div>
                  <div className="text-sm font-medium mt-0.5">{format(addDays(week, i), 'd')}</div>
                  <div className="h-3 flex items-center justify-center mt-0.5">
                    {allDone ? <Check size={11} /> : dayHasEntries.length > 0 && <span className="w-1.5 h-1.5 rounded-full" style={{ background: isSelected ? 'white' : 'var(--accent)' }} />}
                  </div>
                </button>
              )
            })}
          </div>
          <button aria-label="Săptămâna următoare" onClick={() => setSelectedDate(format(addDays(week, 7), 'yyyy-MM-dd'))} className="p-1.5 rounded-lg hover:bg-gray-100"><ChevronRight size={16} /></button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {owner && <button className="btn-secondary flex items-center gap-1.5 text-sm" onClick={() => { setEditing(null); setPlan({ ...emptyPlan, kind: tab, date: selectedDate }); setEditorOpen(true) }}><Plus size={15} />{tab === 'NUTRITION' ? 'Adaugă masă' : 'Adaugă antrenament'}</button>}
          {owner && <TemplatePicker kind={tab as 'WORKOUT' | 'NUTRITION'} query={query} onApplied={() => { void (async () => { const data = await api(`/api/entries?${query}&from=${from}&to=${to}`); setEntries(data.entries) })() }} />}
        </div>

        {tab === 'NUTRITION' && (() => {
          const client = clients.find(c => c.id === clientId)
          const t = client ? { protein: client.dailyProteinTarget, carbs: client.dailyCarbsTarget, fat: client.dailyFatTarget, calories: client.dailyCaloriesTarget } : null
          const totals = selectedEntries.reduce((acc, e) => ({ protein: acc.protein + (e.protein ?? 0), carbs: acc.carbs + (e.carbs ?? 0), fat: acc.fat + (e.fat ?? 0), calories: acc.calories + (e.calories ?? 0) }), { protein: 0, carbs: 0, fat: 0, calories: 0 })
          if (!t || (!t.protein && !t.carbs && !t.fat && !t.calories)) return owner ? <NutritionTargetsEditor clientId={clientId} current={t} onSaved={targets => setClients(cs => cs.map(c => c.id === clientId ? { ...c, ...targets } : c))} /> : null
          const ring = (value: number, target: number, color: string) => {
            const pct = Math.min(100, target ? (value / target) * 100 : 0)
            const c = 2 * Math.PI * 26
            return (
              <svg width="60" height="60" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" stroke="#F1F5F3" strokeWidth="6" />
                <circle cx="32" cy="32" r="26" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100} transform="rotate(-90 32 32)" />
                <text x="32" y="37" textAnchor="middle" fontSize="13" fontWeight="600" fill="#14231d">{Math.round(pct)}%</text>
              </svg>
            )
          }
          return (
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-500">Ținte zilnice — {selectedLabel}</p>
                {owner && <button className="text-xs underline" style={{ color: 'var(--accent)' }} onClick={() => setEditingTargets(true)}>Editează ținte</button>}
              </div>
              {editingTargets && owner && <NutritionTargetsEditor clientId={clientId} current={t} onSaved={targets => { setClients(cs => cs.map(c => c.id === clientId ? { ...c, ...targets } : c)); setEditingTargets(false) }} />}
              {!editingTargets && <div className="flex justify-around">
                {t.protein != null && <div className="text-center">{ring(totals.protein, t.protein, '#0F6E56')}<p className="text-[11px] text-gray-500 mt-1">Proteine</p><p className="text-[10px] text-gray-400">{totals.protein}/{t.protein}g</p></div>}
                {t.carbs != null && <div className="text-center">{ring(totals.carbs, t.carbs, '#3b82f6')}<p className="text-[11px] text-gray-500 mt-1">Carbo</p><p className="text-[10px] text-gray-400">{totals.carbs}/{t.carbs}g</p></div>}
                {t.fat != null && <div className="text-center">{ring(totals.fat, t.fat, '#f59e0b')}<p className="text-[11px] text-gray-500 mt-1">Grăsimi</p><p className="text-[10px] text-gray-400">{totals.fat}/{t.fat}g</p></div>}
              </div>}
            </div>
          )
        })()}

        {editorOpen && owner && <form className="card p-4 space-y-3" onSubmit={e => {
          e.preventDefault(); void action(async () => {
            const { protein, carbs, fat, calories, ...rest } = plan
            const payload: any = { ...rest }
            if (plan.kind === 'NUTRITION') {
              if (protein) payload.protein = Number(protein)
              if (carbs) payload.carbs = Number(carbs)
              if (fat) payload.fat = Number(fat)
              if (calories) payload.calories = Number(calories)
            }
            if (plan.kind === 'WORKOUT' && !payload.muscleGroup) delete payload.muscleGroup
            await api(`/api/entries${editing ? `/${editing.id}` : ''}?${query}`, editing ? 'PATCH' : 'POST', editing ? { ...payload, version: editing.version } : payload)
            setEditorOpen(false)
            const data = await api(`/api/entries?${query}&from=${from}&to=${to}`); setEntries(data.entries)
          })
        }}>
          <h2 className="font-semibold text-sm">{editing ? 'Modifică planul' : 'Plan nou'}</h2>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs">Data<input required type="date" className="field mt-1" value={plan.date} onChange={e => setPlan({ ...plan, date: e.target.value })} /></label>
            <label className="text-xs">Ora<input required type="time" className="field mt-1" value={plan.time} onChange={e => setPlan({ ...plan, time: e.target.value })} /></label>
          </div>
          {plan.kind === 'WORKOUT' && <div>
            <p className="text-xs mb-1.5">Grupă musculară</p>
            <div className="flex flex-wrap gap-1.5">
              {MUSCLE_GROUPS.map(g => (
                <button type="button" key={g} onClick={() => setPlan({ ...plan, muscleGroup: plan.muscleGroup === g ? '' : g })} className="px-3 py-1 rounded-full text-xs" style={plan.muscleGroup === g ? { background: 'var(--accent)', color: 'white' } : { border: '1px solid #E5E7EB' }}>{g}</button>
              ))}
            </div>
          </div>}
          {plan.kind === 'WORKOUT' && plan.muscleGroup && EXERCISES[plan.muscleGroup as keyof typeof EXERCISES] && <div>
            <p className="text-xs mb-1.5 text-gray-500">Alegere rapidă — apasă ca să adaugi</p>
            <div className="flex flex-wrap gap-1.5">
              {EXERCISES[plan.muscleGroup as keyof typeof EXERCISES].map(ex => (
                <button type="button" key={ex} onClick={() => setPlan({ ...plan, details: plan.details ? `${plan.details}\n${ex} — 3 serii x 12 repetări` : `${ex} — 3 serii x 12 repetări` })} className="px-2.5 py-1 rounded-full text-xs bg-[var(--accent-soft)]" style={{ color: 'var(--accent-dark)' }}>+ {ex}</button>
              ))}
            </div>
          </div>}
          <label className="block text-xs">Titlu<input required maxLength={150} className="field mt-1" value={plan.title} onChange={e => setPlan({ ...plan, title: e.target.value })} placeholder={plan.kind === 'NUTRITION' ? 'Mic dejun' : 'Antrenament picioare'} /></label>
          <label className="block text-xs">Detalii<textarea maxLength={8000} rows={4} className="field mt-1" value={plan.details} onChange={e => setPlan({ ...plan, details: e.target.value })} placeholder={plan.kind === 'NUTRITION' ? 'Alimente, cantități…' : 'Exerciții, serii, repetări…'} /></label>
          {plan.kind === 'NUTRITION' && <div className="grid grid-cols-4 gap-2">
            <label className="text-xs">Proteine (g)<input type="number" min="0" className="field mt-1" value={plan.protein} onChange={e => setPlan({ ...plan, protein: e.target.value })} /></label>
            <label className="text-xs">Carbo (g)<input type="number" min="0" className="field mt-1" value={plan.carbs} onChange={e => setPlan({ ...plan, carbs: e.target.value })} /></label>
            <label className="text-xs">Grăsimi (g)<input type="number" min="0" className="field mt-1" value={plan.fat} onChange={e => setPlan({ ...plan, fat: e.target.value })} /></label>
            <label className="text-xs">Kcal<input type="number" min="0" className="field mt-1" value={plan.calories} onChange={e => setPlan({ ...plan, calories: e.target.value })} /></label>
          </div>}
          <div className="flex gap-2"><button className="btn-primary" disabled={busy}>Salvează</button><button type="button" className="btn-secondary" onClick={() => setEditorOpen(false)}>Renunță</button></div>
        </form>}

        {!editorOpen && selectedEntries.length > 0 && owner && (
          <button disabled={savingTemplate} className="text-xs underline flex items-center gap-1 text-gray-500" onClick={async () => {
            const name = prompt(`Nume pentru acest exemplu de ${tab === 'NUTRITION' ? 'zi de nutriție' : 'antrenament'}:`)
            if (!name) return
            setSavingTemplate(true)
            try {
              const data = tab === 'WORKOUT'
                ? { days: [{ label: name, entries: selectedEntries.map(e => ({ title: e.title, details: e.details, muscleGroup: e.muscleGroup ?? undefined })) }] }
                : { targets: { protein: 0, carbs: 0, fat: 0, calories: 0 }, meals: selectedEntries.map(e => ({ time: e.time, title: e.title, details: e.details, protein: e.protein ?? 0, carbs: e.carbs ?? 0, fat: e.fat ?? 0, calories: e.calories ?? 0 })) }
              await api('/api/templates', 'POST', { kind: tab, name, data })
            } catch (e) { setError(e instanceof Error ? e.message : 'Nu am putut salva exemplul.') }
            finally { setSavingTemplate(false) }
          }}><BookmarkPlus size={13} />Salvează ziua asta ca exemplu</button>
        )}


        <p className="text-sm text-gray-500 capitalize">{selectedLabel}</p>

        {selectedEntries.length === 0 && !owner && <div className="card p-6 text-center text-sm text-gray-400">Fără plan pentru această zi.</div>}
        {selectedEntries.length === 0 && owner && <button onClick={() => { setEditing(null); setPlan({ ...emptyPlan, kind: tab, date: selectedDate }); setEditorOpen(true) }} className="w-full card border-dashed p-4 text-sm text-gray-400 flex items-center gap-2 justify-center hover:bg-gray-50"><Plus size={16} />Adaugă un plan pentru această zi</button>}

        {selectedEntries.map(entry => (
          <div key={entry.id} className="card p-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{entry.time}</span>
              {entry.muscleGroup && <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--accent-soft)]" style={{ color: 'var(--accent-dark)' }}>{entry.muscleGroup}</span>}
            </div>
            <div className="text-[15px] font-medium mt-0.5 mb-1.5">{entry.title}</div>
            <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">{entry.details}</p>
            {entry.feedback && <p className="text-sm text-gray-500 mt-2 whitespace-pre-wrap break-words">Observații client: {entry.feedback}</p>}
            {entry.coachNote && <p className="text-sm mt-2 whitespace-pre-wrap break-words rounded-lg px-2 py-1.5" style={{ background: 'var(--accent-soft)', color: 'var(--accent-dark)' }}>Notă instructor: {entry.coachNote}</p>}
            {owner && <CoachNoteInline entry={entry} query={query} onSaved={note => setEntries(es => es.map(x => x.id === entry.id ? { ...x, coachNote: note, version: x.version + 1 } : x))} />}
            <div className="flex items-center gap-2 mt-3">
              {owner ? <>
                <button onClick={() => { setEditing(entry); setPlan({ kind: entry.kind, date: entry.date, time: entry.time, title: entry.title, details: entry.details, muscleGroup: entry.muscleGroup ?? '', protein: entry.protein?.toString() ?? '', carbs: entry.carbs?.toString() ?? '', fat: entry.fat?.toString() ?? '', calories: entry.calories?.toString() ?? '' }); setEditorOpen(true) }} className="btn-secondary flex-1 flex items-center justify-center gap-1.5 text-sm"><Pencil size={15} />Editează</button>
                <button aria-label="Șterge" disabled={busy} onClick={() => { if (confirm('Ștergi această intrare?')) void action(async () => { await api(`/api/entries/${entry.id}?${query}`, 'DELETE', { version: entry.version }); setEntries(en => en.filter(x => x.id !== entry.id)) }) }} className="w-10 h-10 rounded-full border border-red-200 text-red-600 flex items-center justify-center"><Trash2 size={15} /></button>
              </> : <>
                <button onClick={() => setProgress(entry)} className="flex-1 flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium" style={entry.completed ? { background: 'var(--accent)', color: 'white' } : { border: '1px solid #D1D5DB', color: '#4B5563' }}>
                  {entry.completed ? <Check size={16} /> : <Circle size={16} />}{entry.completed ? 'Realizat' : 'Marchează realizat'}
                </button>
                <button aria-label="Observații" onClick={() => setProgress(entry)} className="w-10 h-10 rounded-full border border-gray-300 text-gray-500 flex items-center justify-center"><MessageCircle size={15} /></button>
              </>}
            </div>
          </div>
        ))}

        {progress && !owner && <form className="card p-4 space-y-3" onSubmit={e => { e.preventDefault(); void action(async () => { await api(`/api/entries/${progress.id}?${query}`, 'PATCH', { completed: progress.completed, feedback: progress.feedback, version: progress.version }); setProgress(null); const data = await api(`/api/entries?${query}&from=${from}&to=${to}`); setEntries(data.entries) }) }}>
          <h2 className="font-semibold text-sm">{progress.title}</h2>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={progress.completed} onChange={e => setProgress({ ...progress, completed: e.target.checked })} />Am realizat această activitate</label>
          <label className="block text-xs">Observații pentru instructor<textarea className="field mt-1" rows={3} maxLength={2000} value={progress.feedback} onChange={e => setProgress({ ...progress, feedback: e.target.value })} /></label>
          <div className="flex gap-2"><button className="btn-primary" disabled={busy}>Salvează</button><button type="button" className="btn-secondary" onClick={() => setProgress(null)}>Renunță</button></div>
        </form>}
      </>}

      {tab === 'MESSAGES' && <div className="card p-4 space-y-3">
        {owner && <button className="btn-secondary flex items-center gap-1.5 text-sm" disabled={busy} onClick={() => action(async () => {
          const url = `https://meet.jit.si/fiteasy-${crypto.randomUUID()}`
          await api(`/api/messages?${query}`, 'POST', { text: `Apel video: ${url}` })
          const chat = await api(`/api/messages?${query}`); setMessages(chat.messages)
        })}><Video size={15} />Trimite invitație apel video</button>}
        {hasMore && <button className="text-xs text-gray-500 underline" onClick={() => action(async () => {
          const first = messages[0]; if (!first) return
          const data = await api(`/api/messages?${query}&before=${encodeURIComponent(first.createdAt)}`)
          setMessages(prev => [...data.messages, ...prev]); setHasMore(data.hasMore)
        })}>Încarcă mesaje mai vechi</button>}
        <div className="max-h-[50vh] overflow-y-auto space-y-2">
          {messages.map(m => {
            const videoUrl = /^Apel video: (https:\/\/meet\.jit\.si\/fiteasy-[a-f0-9-]+)$/.exec(m.text)?.[1]
            const mine = m.sender === (owner ? 'INSTRUCTOR' : 'CLIENT')
            return (
              <div key={m.id} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${mine ? 'ml-auto text-white' : 'bg-gray-100'}`} style={mine ? { background: 'var(--accent)' } : {}}>
                <p className="text-[11px] opacity-70 mb-0.5">{m.sender === 'INSTRUCTOR' ? 'Instructor' : 'Client'}</p>
                {videoUrl ? <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="underline flex items-center gap-1"><Video size={14} />Intră în apel · Jitsi ↗</a> : <p className="whitespace-pre-wrap break-words">{m.text}</p>}
              </div>
            )
          })}
          {!messages.length && <p className="text-sm text-gray-400 text-center py-6">Niciun mesaj încă.</p>}
        </div>
        <form className="flex gap-2" onSubmit={e => { e.preventDefault(); void action(async () => { await api(`/api/messages?${query}`, 'POST', { text: draft }); setDraft(''); const chat = await api(`/api/messages?${query}`); setMessages(chat.messages) }) }}>
          <input className="field flex-1" required maxLength={4000} value={draft} onChange={e => setDraft(e.target.value)} placeholder="Scrie un mesaj…" />
          <button className="btn-primary" disabled={busy || !draft.trim()}>Trimite</button>
        </form>
      </div>}
    </div>
  )
}

function NutritionTargetsEditor({ clientId, current, onSaved }: { clientId: string; current: { protein: number | null; carbs: number | null; fat: number | null; calories: number | null } | null; onSaved: (t: { dailyProteinTarget: number | null; dailyCarbsTarget: number | null; dailyFatTarget: number | null; dailyCaloriesTarget: number | null }) => void }) {
  const [form, setForm] = useState({ protein: current?.protein?.toString() ?? '', carbs: current?.carbs?.toString() ?? '', fat: current?.fat?.toString() ?? '', calories: current?.calories?.toString() ?? '' })
  const [busy, setBusy] = useState(false)
  return (
    <form className="card p-4 grid grid-cols-4 gap-2" onSubmit={async e => {
      e.preventDefault(); setBusy(true)
      const payload = {
        action: 'targets', clientId,
        dailyProteinTarget: form.protein ? Number(form.protein) : null,
        dailyCarbsTarget: form.carbs ? Number(form.carbs) : null,
        dailyFatTarget: form.fat ? Number(form.fat) : null,
        dailyCaloriesTarget: form.calories ? Number(form.calories) : null,
      }
      const res = await fetch('/api/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      setBusy(false)
      if (res.ok) onSaved({ dailyProteinTarget: payload.dailyProteinTarget, dailyCarbsTarget: payload.dailyCarbsTarget, dailyFatTarget: payload.dailyFatTarget, dailyCaloriesTarget: payload.dailyCaloriesTarget })
    }}>
      <p className="col-span-4 text-xs text-gray-500 mb-1">Setează țintele zilnice de nutriție pentru acest client</p>
      <label className="text-xs">Proteine (g)<input type="number" min="0" className="field mt-1" value={form.protein} onChange={e => setForm({ ...form, protein: e.target.value })} /></label>
      <label className="text-xs">Carbo (g)<input type="number" min="0" className="field mt-1" value={form.carbs} onChange={e => setForm({ ...form, carbs: e.target.value })} /></label>
      <label className="text-xs">Grăsimi (g)<input type="number" min="0" className="field mt-1" value={form.fat} onChange={e => setForm({ ...form, fat: e.target.value })} /></label>
      <label className="text-xs">Kcal<input type="number" min="0" className="field mt-1" value={form.calories} onChange={e => setForm({ ...form, calories: e.target.value })} /></label>
      <button className="btn-primary col-span-4 text-sm mt-1" disabled={busy}>Salvează ținte</button>
    </form>
  )
}

function CoachNoteInline({ entry, query, onSaved }: { entry: Entry; query: string; onSaved: (note: string) => void }) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState(entry.coachNote)
  const [busy, setBusy] = useState(false)
  if (!open) return <button className="text-xs underline mt-1" style={{ color: 'var(--accent)' }} onClick={() => setOpen(true)}>{entry.coachNote ? 'Editează nota' : '+ Adaugă notă pentru client'}</button>
  return (
    <form className="mt-2 space-y-1.5" onSubmit={async e => {
      e.preventDefault(); setBusy(true)
      const res = await fetch(`/api/entries/${entry.id}?${query}&action=note`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ coachNote: note, version: entry.version }) })
      setBusy(false)
      if (res.ok) { onSaved(note); setOpen(false) }
    }}>
      <textarea className="field text-sm" rows={2} maxLength={2000} value={note} onChange={e => setNote(e.target.value)} placeholder="Corectură, exercițiu alternativ, încurajare…" />
      <div className="flex gap-2"><button className="btn-primary text-xs py-1.5 px-3" disabled={busy}>Salvează</button><button type="button" className="btn-secondary text-xs py-1.5 px-3" onClick={() => setOpen(false)}>Renunță</button></div>
    </form>
  )
}
