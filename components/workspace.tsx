'use client'

import { useEffect, useState } from 'react'
import { addDays, format, startOfWeek } from 'date-fns'
import { Check, Circle, MessageCircle, Pencil, Trash2, Plus, Video, ChevronLeft, ChevronRight } from 'lucide-react'
import { MUSCLE_GROUPS, EXERCISES } from '@/lib/exercises'

type Entry = { id: string; kind: string; date: string; time: string; title: string; details: string; muscleGroup: string | null; completed: boolean; feedback: string; version: number }
type Message = { id: string; text: string; sender: string; createdAt: string }
type ClientOption = { id: string; name: string; phone: string | null; active: boolean }

const emptyPlan = { kind: 'WORKOUT', date: '', time: '09:00', title: '', details: '', muscleGroup: '' }

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

      <nav className="flex gap-2">
        {[['WORKOUT', 'Antrenamente'], ['NUTRITION', 'Nutriție'], ['MESSAGES', 'Mesaje']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className="px-4 py-2 rounded-full text-sm font-medium transition" style={tab === key ? { background: 'var(--accent)', color: 'white' } : { background: 'white', border: '1px solid #E5E7EB' }}>{label}</button>
        ))}
      </nav>

      {tab !== 'MESSAGES' && <>
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

        {owner && <button className="btn-secondary flex items-center gap-1.5 text-sm" onClick={() => { setEditing(null); setPlan({ ...emptyPlan, kind: tab, date: selectedDate }); setEditorOpen(true) }}><Plus size={15} />{tab === 'NUTRITION' ? 'Adaugă masă' : 'Adaugă antrenament'}</button>}

        {editorOpen && owner && <form className="card p-4 space-y-3" onSubmit={e => {
          e.preventDefault(); void action(async () => {
            await api(`/api/entries${editing ? `/${editing.id}` : ''}?${query}`, editing ? 'PATCH' : 'POST', editing ? { ...plan, version: editing.version } : plan)
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
          <div className="flex gap-2"><button className="btn-primary" disabled={busy}>Salvează</button><button type="button" className="btn-secondary" onClick={() => setEditorOpen(false)}>Renunță</button></div>
        </form>}

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
            {entry.feedback && <p className="text-sm text-gray-500 mt-2 whitespace-pre-wrap break-words">Observații: {entry.feedback}</p>}
            <div className="flex items-center gap-2 mt-3">
              {owner ? <>
                <button onClick={() => { setEditing(entry); setPlan({ kind: entry.kind, date: entry.date, time: entry.time, title: entry.title, details: entry.details, muscleGroup: entry.muscleGroup ?? '' }); setEditorOpen(true) }} className="btn-secondary flex-1 flex items-center justify-center gap-1.5 text-sm"><Pencil size={15} />Editează</button>
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
