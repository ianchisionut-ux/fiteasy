'use client'

import { useEffect, useMemo, useState } from 'react'
import { Copy, Dumbbell, GripVertical, Plus, Save, Trash2, X } from 'lucide-react'

type SetRow = { reps: string; weight: string; rpe: string; duration: string }
type ExerciseRow = { name: string; muscleGroup: string; sets: SetRow[] }
type DayRow = { day: number; label: string; notes: string; exercises: ExerciseRow[] }
type ProgramData = { weeks: { number: number; days: DayRow[] }[] }
type Program = { id: string; name: string; description: string; kind: string; status: string; clientId: string | null; client: { id: string; name: string } | null; data: ProgramData; updatedAt: string }
type Client = { id: string; name: string }

const emptySet = (): SetRow => ({ reps: '12', weight: '', rpe: '8', duration: '' })
const emptyDay = (day = 1): DayRow => ({ day, label: `Ziua ${day}`, notes: '', exercises: [] })
const emptyData = (): ProgramData => ({ weeks: [{ number: 1, days: [emptyDay()] }] })

export default function ProgramsManager() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [name, setName] = useState('Program nou')
  const [description, setDescription] = useState('')
  const [clientId, setClientId] = useState('')
  const [status, setStatus] = useState('DRAFT')
  const [data, setData] = useState<ProgramData>(emptyData)
  const [weekIndex, setWeekIndex] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const res = await fetch('/api/programs', { cache: 'no-store' }); const body = await res.json()
    if (!res.ok) throw new Error(body.error || 'Nu am putut încărca programele.')
    setPrograms(body.programs); setClients(body.clients)
  }
  useEffect(() => { load().catch(e => setError(e.message)) }, [])

  function selectProgram(program: Program) {
    setSelectedId(program.id); setName(program.name); setDescription(program.description); setClientId(program.clientId ?? ''); setStatus(program.status); setData(program.data); setWeekIndex(0); setError('')
  }
  function createNew() { setSelectedId(null); setName('Program nou'); setDescription(''); setClientId(''); setStatus('DRAFT'); setData(emptyData()); setWeekIndex(0); setError('') }
  function updateDay(dayIndex: number, patch: Partial<DayRow>) { setData(current => ({ weeks: current.weeks.map((week, wi) => wi === weekIndex ? { ...week, days: week.days.map((day, di) => di === dayIndex ? { ...day, ...patch } : day) } : week) })) }
  function updateExercise(dayIndex: number, exerciseIndex: number, patch: Partial<ExerciseRow>) { const day = data.weeks[weekIndex].days[dayIndex]; updateDay(dayIndex, { exercises: day.exercises.map((ex, ei) => ei === exerciseIndex ? { ...ex, ...patch } : ex) }) }
  function addExercise(dayIndex: number) { const day = data.weeks[weekIndex].days[dayIndex]; updateDay(dayIndex, { exercises: [...day.exercises, { name: 'Exercițiu nou', muscleGroup: '', sets: [emptySet(), emptySet(), emptySet()] }] }) }
  function duplicateWeek() { setData(current => ({ weeks: [...current.weeks, { number: current.weeks.length + 1, days: structuredClone(current.weeks[weekIndex].days) }] })); setWeekIndex(data.weeks.length) }

  async function save() {
    setBusy(true); setError('')
    try {
      const payload = selectedId ? { action: 'update', id: selectedId, name, description, status, clientId: clientId || null, data } : { action: 'create', name, description, kind: 'WORKOUT', clientId: clientId || null, data }
      const res = await fetch('/api/programs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Salvarea a eșuat.')
      await load(); if (!selectedId) setSelectedId(body.program.id)
    } catch (e) { setError(e instanceof Error ? e.message : 'Salvarea a eșuat.') } finally { setBusy(false) }
  }
  async function remove() {
    if (!selectedId || !confirm('Ștergi acest program?')) return
    setBusy(true); const res = await fetch('/api/programs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', id: selectedId }) }); setBusy(false)
    if (res.ok) { await load(); createNew() }
  }

  const exerciseCount = useMemo(() => data.weeks.reduce((sum, week) => sum + week.days.reduce((n, day) => n + day.exercises.length, 0), 0), [data])

  return <div className="space-y-5">
    <div className="flex items-end justify-between"><div><p className="page-kicker">BIBLIOTECĂ ȘI ATRIBUIRE</p><h1 className="text-2xl font-semibold mt-1">Programe de antrenament</h1><p className="text-sm text-gray-500 mt-1">Construiește programe pe săptămâni, zile, exerciții și serii.</p></div><button onClick={createNew} className="btn-primary flex items-center gap-2"><Plus size={16}/>Program nou</button></div>
    {error && <p className="text-sm text-red-600">{error}</p>}
    <div className="grid xl:grid-cols-[280px_minmax(0,1fr)] gap-5 items-start">
      <aside className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100"><p className="text-xs uppercase tracking-wider text-gray-400">Programele tale</p><p className="text-sm font-semibold mt-1">{programs.length} programe</p></div>
        <div className="max-h-[680px] overflow-y-auto">
          {programs.map(program => <button key={program.id} onClick={() => selectProgram(program)} className={`w-full text-left p-4 border-b border-gray-100 last:border-0 hover:bg-[#f5faf9] ${selectedId === program.id ? 'bg-[#e9f7f5]' : ''}`}><div className="flex items-center justify-between"><p className="text-sm font-semibold truncate">{program.name}</p><span className={`program-status ${program.status === 'ACTIVE' ? 'program-status-active' : ''}`}>{program.status === 'ACTIVE' ? 'Activ' : 'Ciornă'}</span></div><p className="text-xs text-gray-400 mt-1">{program.client?.name ?? 'Șablon neatribuit'}</p></button>)}
          {!programs.length && <p className="text-sm text-gray-400 p-5">Creează primul program.</p>}
        </div>
      </aside>

      <main className="card p-5 lg:p-6 min-w-0">
        <div className="grid md:grid-cols-[1fr_220px] gap-4 mb-5">
          <div><label className="text-xs text-gray-500">Nume program</label><input className="builder-title" value={name} onChange={e => setName(e.target.value)} /></div>
          <div><label className="text-xs text-gray-500">Atribuie clientului</label><select className="field mt-1" value={clientId} onChange={e => setClientId(e.target.value)}><option value="">Păstrează ca șablon</option>{clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}</select></div>
        </div>
        <textarea className="field mb-5" rows={2} placeholder="Descriere și obiectiv…" value={description} onChange={e => setDescription(e.target.value)} />
        <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-gray-100">
          {data.weeks.map((week, index) => <button key={week.number} onClick={() => setWeekIndex(index)} className={`week-tab ${weekIndex === index ? 'week-tab-active' : ''}`}>Săptămâna {week.number}</button>)}
          <button onClick={duplicateWeek} className="week-tab flex items-center gap-1"><Copy size={13}/>Duplică săptămâna</button>
        </div>
        <div className="grid 2xl:grid-cols-2 gap-4 mt-5">
          {data.weeks[weekIndex].days.map((day, dayIndex) => <section key={dayIndex} className="builder-day">
            <div className="flex items-center gap-3 border-b border-gray-100 p-4"><span className="day-number">{day.day}</span><input className="font-semibold flex-1 min-w-0 outline-none" value={day.label} onChange={e => updateDay(dayIndex, { label: e.target.value })}/>{data.weeks[weekIndex].days.length > 1 && <button onClick={() => setData(current => ({ weeks: current.weeks.map((week, wi) => wi === weekIndex ? { ...week, days: week.days.filter((_, di) => di !== dayIndex) } : week) }))} className="text-gray-400"><X size={16}/></button>}</div>
            <div className="divide-y divide-gray-100">
              {day.exercises.map((exercise, exerciseIndex) => <div key={exerciseIndex} className="p-4">
                <div className="flex items-center gap-2 mb-3"><GripVertical size={15} className="text-gray-300"/><Dumbbell size={16} className="text-[#1ba99f]"/><input className="font-medium text-sm flex-1 outline-none border-b border-transparent focus:border-[#2bb8ad]" value={exercise.name} onChange={e => updateExercise(dayIndex, exerciseIndex, { name: e.target.value })}/><button onClick={() => updateDay(dayIndex, { exercises: day.exercises.filter((_, ei) => ei !== exerciseIndex) })} className="text-gray-300 hover:text-red-500"><Trash2 size={14}/></button></div>
                <div className="grid grid-cols-[32px_repeat(4,minmax(44px,1fr))] gap-1 text-[10px] text-gray-400 mb-1"><span>SET</span><span>REPS</span><span>KG</span><span>RPE</span><span>TIMP</span></div>
                {exercise.sets.map((set, setIndex) => <div key={setIndex} className="grid grid-cols-[32px_repeat(4,minmax(44px,1fr))] gap-1 mb-1"><span className="set-index">{setIndex + 1}</span>{(['reps','weight','rpe','duration'] as const).map(key => <input key={key} className="set-field" value={set[key]} onChange={e => updateExercise(dayIndex, exerciseIndex, { sets: exercise.sets.map((row, si) => si === setIndex ? { ...row, [key]: e.target.value } : row) })}/>)}</div>)}
                <button onClick={() => updateExercise(dayIndex, exerciseIndex, { sets: [...exercise.sets, emptySet()] })} className="text-xs text-[#16877e] mt-2">+ Adaugă serie</button>
              </div>)}
            </div>
            <button onClick={() => addExercise(dayIndex)} className="builder-add"><Plus size={14}/>Adaugă exercițiu</button>
            <textarea className="w-full border-t border-gray-100 p-3 text-xs outline-none resize-none" rows={2} placeholder="Notițe pentru zi…" value={day.notes} onChange={e => updateDay(dayIndex, { notes: e.target.value })}/>
          </section>)}
          {data.weeks[weekIndex].days.length < 7 && <button onClick={() => setData(current => ({ weeks: current.weeks.map((week, wi) => wi === weekIndex ? { ...week, days: [...week.days, emptyDay(week.days.length + 1)] } : week) }))} className="builder-new-day"><Plus size={18}/>Adaugă zi de antrenament</button>}
        </div>
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100"><p className="text-xs text-gray-400">{data.weeks.length} săptămâni · {exerciseCount} exerciții</p><div className="flex gap-2">{selectedId && <button onClick={remove} className="btn-secondary text-red-600" disabled={busy}><Trash2 size={14} className="inline mr-1"/>Șterge</button>}<select className="btn-secondary" value={status} onChange={e => setStatus(e.target.value)}><option value="DRAFT">Ciornă</option><option value="ACTIVE">Activ</option><option value="ARCHIVED">Arhivat</option></select><button onClick={save} className="btn-primary flex items-center gap-2" disabled={busy || !name.trim()}><Save size={15}/>{busy ? 'Se salvează…' : 'Salvează'}</button></div></div>
      </main>
    </div>
  </div>
}
