'use client'

import { useEffect, useState } from 'react'
import { Dumbbell } from 'lucide-react'
type SetRow = { reps: string; weight: string; rpe: string; duration: string }
type Program = { id: string; name: string; description: string; data: { weeks: { number: number; days: { day: number; label: string; notes: string; exercises: { name: string; muscleGroup: string; sets: SetRow[] }[] }[] }[] } }
export default function AssignedPrograms({ query }: { query: string }) {
  const [programs, setPrograms] = useState<Program[]>([])
  const [selected, setSelected] = useState(0)
  const [week, setWeek] = useState(0)
  const [error, setError] = useState('')
  useEffect(() => { fetch(`/api/client-programs?${query}`, { cache: 'no-store' }).then(async res => { const body = await res.json(); if (!res.ok) throw new Error(body.error); setPrograms(body.programs) }).catch(e => setError(e.message)) }, [query])
  const program = programs[selected]
  if (error) return <p className="text-sm text-red-600">{error}</p>
  if (!program) return <div className="card p-12 text-center text-sm text-gray-400">Nu există un program activ atribuit.</div>
  return <div className="space-y-5"><div className="flex gap-2 overflow-x-auto">{programs.map((item, index) => <button key={item.id} onClick={() => { setSelected(index); setWeek(0) }} className={`week-tab ${selected === index ? 'week-tab-active' : ''}`}>{item.name}</button>)}</div><div className="card p-5"><div className="flex items-end justify-between border-b border-gray-100 pb-4"><div><p className="page-kicker">PROGRAM ACTIV</p><h2 className="text-xl font-semibold mt-1">{program.name}</h2><p className="text-sm text-gray-400 mt-1">{program.description}</p></div><div className="flex gap-1">{program.data.weeks.map((item, index) => <button key={item.number} onClick={() => setWeek(index)} className={`week-tab ${week === index ? 'week-tab-active' : ''}`}>S{item.number}</button>)}</div></div><div className="grid lg:grid-cols-2 gap-4 mt-5">{program.data.weeks[week]?.days.map(day => <section key={day.day} className="builder-day"><div className="p-4 flex items-center gap-3 border-b border-gray-100"><span className="day-number">{day.day}</span><h3 className="font-semibold">{day.label}</h3></div><div className="divide-y divide-gray-100">{day.exercises.map((exercise, index) => <div key={index} className="p-4"><div className="flex items-center gap-2"><Dumbbell size={15} className="text-[#23aaa0]"/><p className="text-sm font-medium">{exercise.name}</p></div><div className="mt-3 grid grid-cols-4 gap-2 text-center">{exercise.sets.map((set, setIndex) => <div key={setIndex} className="bg-[#f5f8f7] rounded p-2"><p className="text-[10px] text-gray-400">Set {setIndex + 1}</p><p className="text-xs font-medium mt-1">{set.reps || '—'} reps</p><p className="text-[10px] text-gray-400 mt-0.5">{set.weight ? `${set.weight} kg` : set.duration || `RPE ${set.rpe}`}</p></div>)}</div></div>)}</div>{day.notes && <p className="p-4 text-xs text-gray-500 border-t border-gray-100">{day.notes}</p>}</section>)}</div></div></div>
}
