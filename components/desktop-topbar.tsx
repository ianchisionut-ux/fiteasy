import { BellRing, MessageSquare, Plus } from 'lucide-react'

export default function DesktopTopbar({ instructorName }: { instructorName: string }) {
  const initials = instructorName.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() || 'FC'
  return (
    <header className="desktop-topbar hidden lg:flex">
      <p className="text-sm text-gray-400">Organizează activitatea clienților tăi</p>
      <div className="ml-auto flex items-center gap-2">
        <a href="/dashboard/messages" className="topbar-icon" aria-label="Mesaje"><MessageSquare size={18} /></a>
        <a href="/dashboard/reminders" className="topbar-icon" aria-label="Remindere"><BellRing size={18} /></a>
        <a href="/dashboard?new=1" className="topbar-add"><Plus size={15} />Adaugă client</a>
        <div className="h-8 w-px bg-gray-200 mx-1" />
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#172622] text-white flex items-center justify-center text-xs font-semibold">{initials}</div>
          <div className="leading-tight"><p className="text-sm font-medium">{instructorName || 'Instructor'}</p><p className="text-[11px] text-gray-400">Administrator</p></div>
        </div>
      </div>
    </header>
  )
}
