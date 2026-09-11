'use client'

import { useEffect, useState } from 'react'
import { addMonths, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek, addDays } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type OverviewEntry = { id: string; date: string; kind: string; title: string; time: string; client: { id: string; name: string } }

async function api(url: string) {
  const res = await fetch(url, { cache: 'no-store' })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error || 'Cererea a eșuat.')
  return data ?? {}
}

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export default function MonthOverview({ onSelectClient }: { onSelectClient: (clientId: string) => void }) {
  const [month, setMonth] = useState(startOfMonth(new Date()))
  const [entries, setEntries] = useState<OverviewEntry[]>([])
  const [error, setError] = useState('')

  const gridStart = startOfWeek(month, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
  const days: Date[] = []
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) days.push(d)

  useEffect(() => {
    const from = format(gridStart, 'yyyy-MM-dd')
    const to = format(gridEnd, 'yyyy-MM-dd')
    api(`/api/entries/overview?from=${from}&to=${to}`).then(d => setEntries(d.entries)).catch(e => setError(e.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month])

  const dayEntries = (d: Date) => entries.filter(e => e.date === format(d, 'yyyy-MM-dd'))

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold capitalize">{format(month, 'MMMM yyyy')}</span>
        <div className="flex gap-1">
          <button aria-label="Luna precedentă" onClick={() => setMonth(m => addMonths(m, -1))} className="p-1.5 rounded-lg hover:bg-gray-100"><ChevronLeft size={16} /></button>
          <button aria-label="Luna următoare" onClick={() => setMonth(m => addMonths(m, 1))} className="p-1.5 rounded-lg hover:bg-gray-100"><ChevronRight size={16} /></button>
        </div>
      </div>
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-gray-400 mb-1">
        {WEEKDAYS.map((w, i) => <div key={i}>{w}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map(d => {
          const list = dayEntries(d)
          const inMonth = d.getMonth() === month.getMonth()
          const workouts = list.filter(e => e.kind === 'WORKOUT').length
          const nutrition = list.filter(e => e.kind === 'NUTRITION').length
          return (
            <div key={d.toISOString()} className="rounded-lg p-1 min-h-[54px]" style={{ opacity: inMonth ? 1 : 0.35 }}>
              <div className="text-[11px] text-gray-500 text-center">{format(d, 'd')}</div>
              <div className="flex flex-col gap-0.5 mt-0.5">
                {workouts > 0 && <span className="text-[9px] text-white text-center rounded px-1 py-0.5 truncate" style={{ background: 'var(--accent)' }}>{workouts} antr.</span>}
                {nutrition > 0 && <span className="text-[9px] text-white text-center rounded px-1 py-0.5 truncate" style={{ background: '#3b82f6' }}>{nutrition} mese</span>}
                {list.length > 0 && (
                  <button className="text-[9px] text-gray-400 underline truncate text-left" onClick={() => onSelectClient(list[0].client.id)}>
                    {Array.from(new Set(list.map(e => e.client.name))).join(', ')}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
