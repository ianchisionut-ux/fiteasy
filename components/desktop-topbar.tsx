import { Bell, CircleHelp, Plus, Search } from 'lucide-react'

export default function DesktopTopbar({ instructorName }: { instructorName: string }) {
  const initials = instructorName.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() || 'FC'
  return (
    <header className="desktop-topbar hidden lg:flex">
      <div className="relative w-72">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input className="topbar-search" placeholder="Caută client, plan sau mesaj" />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button className="topbar-icon" aria-label="Ajutor"><CircleHelp size={18} /></button>
        <button className="topbar-icon relative" aria-label="Notificări"><Bell size={18} /><span className="notification-dot" /></button>
        <a href="/dashboard" className="topbar-add"><Plus size={15} />Adaugă client</a>
        <div className="h-8 w-px bg-gray-200 mx-1" />
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#172622] text-white flex items-center justify-center text-xs font-semibold">{initials}</div>
          <div className="leading-tight"><p className="text-sm font-medium">{instructorName || 'Instructor'}</p><p className="text-[11px] text-gray-400">Antrenor</p></div>
        </div>
      </div>
    </header>
  )
}
