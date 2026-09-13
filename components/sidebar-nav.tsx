'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useSearchParams } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Apple, BarChart3, Building2, CalendarDays, Dumbbell, Home,
  LogOut, MessageSquare, Settings, ShieldCheck, Users, UsersRound,
} from 'lucide-react'

export default function SidebarNav({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const view = searchParams.get('view')
  const client = searchParams.get('client')
  const tab = searchParams.get('tab') ?? 'WORKOUT'
  const onDashboard = pathname === '/dashboard'
  const clientHref = (nextTab: string) => client
    ? `/dashboard?client=${encodeURIComponent(client)}${nextTab === 'WORKOUT' ? '' : `&tab=${nextTab}`}`
    : '/dashboard'

  const secondaryItem = (active: boolean) =>
    `sidebar-secondary-item ${active ? 'sidebar-secondary-item-active' : ''}`

  return (
    <aside className="hidden lg:flex lg:flex-shrink-0 bg-white border-r border-[#e8eeee] min-h-[calc(100vh-3rem)]">
      <div className="sidebar-rail">
        <Link href="/dashboard?view=stats" className="sidebar-mark" aria-label="FitEasy">
          <Image src="/fiteasy-logo.png" alt="fiteasy.ro" width={209} height={98} className="w-10 h-10 object-contain" priority />
        </Link>
        <nav className="flex-1 flex flex-col items-center gap-2 mt-6">
          <Link title="Acasă" href="/dashboard?view=stats" className={`rail-button ${onDashboard && view === 'stats' ? 'rail-button-active' : ''}`}><Home size={20} /></Link>
          <Link title="Clienți" href="/dashboard" className={`rail-button ${onDashboard && view !== 'stats' ? 'rail-button-active' : ''}`}><UsersRound size={20} /></Link>
          <Link title="Programe" href={clientHref('WORKOUT')} className={`rail-button ${client && tab === 'WORKOUT' ? 'rail-button-active' : ''}`}><Dumbbell size={20} /></Link>
          <Link title="Nutriție" href={clientHref('NUTRITION')} className={`rail-button ${client && tab === 'NUTRITION' ? 'rail-button-active' : ''}`}><Apple size={20} /></Link>
          <Link title="Mesaje" href={clientHref('MESSAGES')} className={`rail-button ${client && tab === 'MESSAGES' ? 'rail-button-active' : ''}`}><MessageSquare size={20} /></Link>
          {isSuperAdmin && <Link title="Administrare" href="/superadmin" className={`rail-button ${pathname === '/superadmin' ? 'rail-button-active' : ''}`}><Building2 size={20} /></Link>}
        </nav>
        <button title="Deconectare" onClick={() => signOut({ callbackUrl: '/login' })} className="rail-button"><LogOut size={19} /></button>
      </div>

      <div className="sidebar-panel">
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400 font-semibold">FitEasy Coach</p>
          <h2 className="text-lg font-semibold mt-1">Spațiu de lucru</h2>
        </div>
        <nav className="space-y-1">
          <Link href="/dashboard?view=stats" className={secondaryItem(onDashboard && view === 'stats')}><Home size={17} />Panou general</Link>
          <Link href="/dashboard" className={secondaryItem(onDashboard && !client && view !== 'stats')}><Users size={17} />Toți clienții</Link>
          <Link href={clientHref('WORKOUT')} className={secondaryItem(Boolean(client) && tab === 'WORKOUT')}><CalendarDays size={17} />Calendar & plan</Link>
          <Link href={clientHref('NUTRITION')} className={secondaryItem(Boolean(client) && tab === 'NUTRITION')}><Apple size={17} />Nutriție</Link>
          <Link href={clientHref('PROGRES')} className={secondaryItem(Boolean(client) && tab === 'PROGRES')}><BarChart3 size={17} />Progres</Link>
          <Link href={clientHref('MESSAGES')} className={secondaryItem(Boolean(client) && tab === 'MESSAGES')}><MessageSquare size={17} />Mesaje și note</Link>
          {isSuperAdmin && <Link href="/superadmin" className={secondaryItem(pathname === '/superadmin')}><ShieldCheck size={17} />Administrare</Link>}
        </nav>
        <div className="mt-auto pt-6 border-t border-[#edf1f0]">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-[#d9f5ef] text-[#158e80] flex items-center justify-center"><Settings size={17} /></div>
            <div><p className="text-sm font-medium">Setări</p><p className="text-[11px] text-gray-400">Cont instructor</p></div>
          </div>
        </div>
      </div>
    </aside>
  )
}
