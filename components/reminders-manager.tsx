'use client'

import { useEffect, useState } from 'react'
import { BellRing, Camera, ClipboardCheck, MessageSquare, Plus, Ruler, Scale, Trash2, X } from 'lucide-react'

type Client = { id: string; name: string }
type Reminder = { id: string; clientId: string; type: string; title: string; details: string; time: string; days: string; active: boolean; client: Client }
const TYPES = [
  { key: 'WEIGH_IN', label: 'Cântărire', icon: Scale }, { key: 'PROGRESS_PHOTO', label: 'Fotografii progres', icon: Camera },
  { key: 'AUTO_MESSAGE', label: 'Mesaj automat', icon: MessageSquare }, { key: 'FITNESS_TEST', label: 'Test fitness', icon: ClipboardCheck },
  { key: 'MEASUREMENT', label: 'Măsurători', icon: Ruler }, { key: 'HABIT', label: 'Obicei zilnic', icon: BellRing },
]
const DAYS = [{ value: 1, label: 'L' }, { value: 2, label: 'M' }, { value: 3, label: 'M' }, { value: 4, label: 'J' }, { value: 5, label: 'V' }, { value: 6, label: 'S' }, { value: 0, label: 'D' }]
const blank = { clientId: '', type: 'WEIGH_IN', title: 'Cântărire săptămânală', details: '', time: '09:00', days: '1', active: true }

export default function RemindersManager() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [drawer, setDrawer] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(blank)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function load() { const res = await fetch('/api/reminders', { cache: 'no-store' }); const body = await res.json(); if (!res.ok) throw new Error(body.error); setReminders(body.reminders); setClients(body.clients) }
  useEffect(() => { load().catch(e => setError(e.message)) }, [])
  function open(reminder?: Reminder) { if (reminder) { setEditingId(reminder.id); setForm({ clientId: reminder.clientId, type: reminder.type, title: reminder.title, details: reminder.details, time: reminder.time, days: reminder.days, active: reminder.active }) } else { setEditingId(null); setForm({ ...blank, clientId: clients[0]?.id ?? '' }) } setDrawer(true) }
  function selectType(type: string) { const label = TYPES.find(t => t.key === type)?.label ?? ''; setForm(current => ({ ...current, type, title: current.title === TYPES.find(t => t.key === current.type)?.label || !current.title ? label : current.title })) }
  function toggleDay(day: number) { const selected = form.days.split(',').filter(Boolean).map(Number); const next = selected.includes(day) ? selected.filter(d => d !== day) : [...selected, day]; setForm({ ...form, days: (next.length ? next : [day]).join(',') }) }
  async function save() { setBusy(true); setError(''); const payload = editingId ? { action: 'update', id: editingId, ...form } : { action: 'create', ...form }; const res = await fetch('/api/reminders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); const body = await res.json(); setBusy(false); if (!res.ok) { setError(body.error || 'Salvarea a eșuat.'); return } setDrawer(false); await load() }
  async function remove(id: string) { if (!confirm('Ștergi acest reminder?')) return; await fetch('/api/reminders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', id }) }); await load() }
  async function toggle(reminder: Reminder) { const payload = { action: 'update', id: reminder.id, clientId: reminder.clientId, type: reminder.type, title: reminder.title, details: reminder.details, time: reminder.time, days: reminder.days, active: !reminder.active }; await fetch('/api/reminders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); await load() }

  return <div className="space-y-5">
    <div className="flex items-end justify-between"><div><p className="page-kicker">AUTOMATIZARE COACHING</p><h1 className="text-2xl font-semibold mt-1">Remindere</h1><p className="text-sm text-gray-500 mt-1">Configurează sarcini recurente pentru clienți.</p></div><button onClick={() => open()} className="btn-primary flex items-center gap-2"><Plus size={16}/>Adaugă reminder</button></div>
    {error && <p className="text-sm text-red-600">{error}</p>}
    <div className="grid md:grid-cols-3 gap-4">{TYPES.slice(0, 3).map(type => { const Icon = type.icon; const count = reminders.filter(r => r.type === type.key && r.active).length; return <div key={type.key} className="card p-4 flex items-center gap-3"><div className="activity-icon"><Icon size={17}/></div><div><p className="text-sm font-medium">{type.label}</p><p className="text-xs text-gray-400">{count} active</p></div></div> })}</div>
    <div className="card overflow-hidden"><div className="grid grid-cols-[1.2fr_1fr_110px_120px_88px] gap-3 px-5 py-3 text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100"><span>Reminder</span><span>Client</span><span>Ora</span><span>Repetare</span><span>Status</span></div>{reminders.map(reminder => { const config = TYPES.find(t => t.key === reminder.type) ?? TYPES[0]; const Icon = config.icon; return <div key={reminder.id} className="grid grid-cols-[1.2fr_1fr_110px_120px_88px] gap-3 items-center px-5 py-4 border-b border-gray-100 last:border-0 hover:bg-[#fafcfb]"><button onClick={() => open(reminder)} className="flex items-center gap-3 text-left min-w-0"><div className="activity-icon"><Icon size={16}/></div><div className="min-w-0"><p className="text-sm font-medium truncate">{reminder.title}</p><p className="text-xs text-gray-400">{config.label}</p></div></button><span className="text-sm truncate">{reminder.client.name}</span><span className="text-sm">{reminder.time}</span><span className="text-xs text-gray-500">{reminder.days.split(',').length === 7 ? 'Zilnic' : `${reminder.days.split(',').length} zile/săpt.`}</span><div className="flex items-center gap-2"><button onClick={() => toggle(reminder)} className={`switch ${reminder.active ? 'switch-on' : ''}`}><span/></button><button onClick={() => remove(reminder.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={15}/></button></div></div>})}{!reminders.length && <p className="text-sm text-gray-400 text-center py-12">Niciun reminder configurat.</p>}</div>

    {drawer && <><button className="drawer-backdrop" aria-label="Închide" onClick={() => setDrawer(false)}/><aside className="plan-drawer"><div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5"><div><p className="page-kicker">REMINDER</p><h2 className="text-xl font-semibold mt-1">{editingId ? 'Editează reminder' : 'Adaugă reminder'}</h2></div><button onClick={() => setDrawer(false)} className="w-9 h-9 rounded-full border border-gray-200 grid place-items-center"><X size={16}/></button></div>
      <div className="space-y-5"><label className="block text-sm">Client<select className="field mt-1" value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })}><option value="">Alege clientul</option>{clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
      <div><p className="text-sm mb-2">Tip reminder</p><div className="grid grid-cols-2 gap-2">{TYPES.map(type => { const Icon = type.icon; return <button key={type.key} onClick={() => selectType(type.key)} className={`reminder-type ${form.type === type.key ? 'reminder-type-active' : ''}`}><Icon size={17}/><span>{type.label}</span></button> })}</div></div>
      <label className="block text-sm">Titlu<input className="field mt-1" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}/></label>
      <label className="block text-sm">Detalii<textarea className="field mt-1" rows={3} value={form.details} onChange={e => setForm({ ...form, details: e.target.value })} placeholder="Instrucțiuni pentru client…"/></label>
      <label className="block text-sm">Ora notificării<input type="time" className="field mt-1" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}/></label>
      <div><p className="text-sm mb-2">Repetă în zilele</p><div className="grid grid-cols-7 gap-2">{DAYS.map(day => <button key={day.value} onClick={() => toggleDay(day.value)} className={`day-toggle ${form.days.split(',').includes(String(day.value)) ? 'day-toggle-active' : ''}`}>{day.label}</button>)}</div></div></div>
      <div className="drawer-actions"><button className="btn-secondary" onClick={() => setDrawer(false)}>Renunță</button><button className="btn-primary" onClick={save} disabled={busy || !form.clientId || !form.title}>{busy ? 'Se salvează…' : 'Salvează'}</button></div>
    </aside></>}
  </div>
}
