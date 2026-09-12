'use client'

import { useEffect, useMemo, useState } from 'react'
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ro } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'

const localizer = dateFnsLocalizer({
  format, parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: ro }),
  getDay,
  locales: { ro },
})

const DnDCalendar = withDragAndDrop(Calendar) as any

type Entry = { id: string; kind: string; date: string; time: string; title: string; completed: boolean; [key: string]: any }

export default function BigCalendar({ entries, kind, onSelectSlot, onSelectEntry, onMoveEntry, onRangeChange }: {
  entries: Entry[]
  kind: 'WORKOUT' | 'NUTRITION'
  onSelectSlot: (date: string, time: string) => void
  onSelectEntry: (entry: Entry) => void
  onMoveEntry: (entry: Entry, date: string, time: string) => void
  onRangeChange: (from: string, to: string) => void
}) {
  const [view, setView] = useState<any>(Views.WEEK)
  const [currentDate, setCurrentDate] = useState(new Date())

  const notifyRange = (date: Date, v: any) => {
    if (v === Views.MONTH) {
      const start = startOfWeek(new Date(date.getFullYear(), date.getMonth(), 1), { locale: ro })
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 7)
      onRangeChange(format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd'))
    } else if (v === Views.WEEK) {
      const start = startOfWeek(date, { locale: ro })
      onRangeChange(format(start, 'yyyy-MM-dd'), format(new Date(start.getTime() + 6 * 86400_000), 'yyyy-MM-dd'))
    } else {
      onRangeChange(format(date, 'yyyy-MM-dd'), format(date, 'yyyy-MM-dd'))
    }
  }

  useEffect(() => { notifyRange(currentDate, view) }, [])

  const events = useMemo(() => entries.filter(e => e.kind === kind).map(e => {
    const start = new Date(`${e.date}T${e.time}:00`)
    const end = new Date(start.getTime() + 45 * 60_000)
    return { id: e.id, title: e.title, start, end, resource: e }
  }), [entries, kind])

  return (
    <div className="card p-2 lg:p-3" style={{ height: 560 }}>
      <DnDCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        culture="ro"
        view={view}
        onView={v => { setView(v); notifyRange(currentDate, v) }}
        date={currentDate}
        onNavigate={d => { setCurrentDate(d); notifyRange(d, view) }}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        step={30}
        timeslots={2}
        selectable
        popup
        messages={{ today: 'Azi', previous: '‹', next: '›', month: 'Lună', week: 'Săptămână', day: 'Zi', noEventsInRange: 'Nimic planificat.', showMore: (c: number) => `+${c} mai multe` }}
        onSelectSlot={(slot: { start: Date }) => onSelectSlot(format(slot.start, 'yyyy-MM-dd'), format(slot.start, 'HH:mm'))}
        onSelectEvent={(event: any) => onSelectEntry(event.resource)}
        onEventDrop={({ event, start }: any) => onMoveEntry(event.resource, format(start, 'yyyy-MM-dd'), format(start, 'HH:mm'))}
        resizable={false}
        eventPropGetter={(event: any) => ({
          style: {
            background: event.resource.completed ? '#0F6E56' : (kind === 'WORKOUT' ? '#0F6E56AA' : '#3b82f6AA'),
            borderRadius: '6px', border: 'none', fontSize: '12px',
          },
        })}
      />
    </div>
  )
}
