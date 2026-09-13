'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useSearchParams } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { BarChart3, BellRing, ChevronLeft, ChevronRight, Dumbbell, LogOut, MessageSquare, ShieldCheck, Users } from 'lucide-react'

const BASE_ITEMS = [
  { href: '/dashboard?view=stats', match: '/dashboard:stats', label: 'Panou general', icon: BarChart3 },
  { href: '/dashboard', match: '/dashboard:clients', label: 'Clienți', icon: Users },
  { href: '/dashboard/programs', match: '/dashboard/programs', label: 'Programe', icon: Dumbbell },
  { href: '/dashboard/reminders', match: '/dashboard/reminders', label: 'Remindere', icon: BellRing },
  { href: '/dashboard/messages', match: '/dashboard/messages', label: 'Mesaje', icon: MessageSquare },
]

export default function SidebarNav({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const active = pathname === '/dashboard'
    ? (searchParams.get('view') === 'stats' ? '/dashboard:stats' : '/dashboard:clients')
    : pathname
  const items = isSuperAdmin ? [...BASE_ITEMS, { href: '/superadmin', match: '/superadmin', label: 'Superadmin', icon: ShieldCheck }] : BASE_ITEMS

  return (
    <aside className={`hidden lg:flex flex-col flex-shrink-0 bg-white border-r border-[#e8eeee] min-h-[calc(100vh-2rem)] transition-[width] duration-200 ${collapsed ? 'w-[76px]' : 'w-[232px]'}`}>
      <div className={`h-[76px] flex items-center border-b border-[#edf1f0] ${collapsed ? 'justify-center' : 'px-5 justify-between'}`}>
        <Link href="/dashboard?view=stats" className="flex items-center gap-2 overflow-hidden">
          <Image src="/fiteasy-logo.png" alt="FitEasy" width={209} height={98} className="w-10 h-10 object-contain shrink-0" priority />
          {!collapsed && <span className="font-semibold tracking-[.12em] text-xs whitespace-nowrap">FITEASY COACH</span>}
        </Link>
      </div>
      <button onClick={() => setCollapsed(v => !v)} className="w-8 h-8 rounded border border-gray-200 bg-white self-end -mr-4 mt-5 z-10 grid place-items-center text-gray-500 shadow-sm" aria-label={collapsed ? 'Extinde meniul' : 'Restrânge meniul'}>{collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}</button>
      <nav className="flex-1 px-3 pt-4 space-y-1">
        {items.map(item => {
          const Icon = item.icon
          const selected = item.match === '/superadmin' ? pathname.startsWith('/superadmin') : active === item.match
          return <Link key={item.match} href={item.href} title={collapsed ? item.label : undefined} className={`single-nav-item ${selected ? 'single-nav-item-active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}><Icon size={18} className="shrink-0" />{!collapsed && <span>{item.label}</span>}</Link>
        })}
      </nav>
      <div className="px-3 pb-4 space-y-1 border-t border-[#edf1f0] pt-3">
        <button onClick={() => signOut({ callbackUrl: '/login' })} className={`single-nav-item w-full ${collapsed ? 'justify-center px-0' : ''}`}><LogOut size={18} />{!collapsed && <span>Deconectare</span>}</button>
      </div>
    </aside>
  )
}
