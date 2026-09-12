'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useSearchParams } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Home, Users, LogOut, ShieldCheck } from 'lucide-react'

export default function SidebarNav({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const view = searchParams.get('view')
  const onDashboard = pathname === '/dashboard'
  const activeHome = onDashboard && (view === 'stats')
  const activeClients = onDashboard && view !== 'stats'

  const item = (active: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${active ? 'text-white' : 'text-gray-600 hover:bg-gray-100'}`
  const itemStyle = (active: boolean) => active ? { background: 'var(--accent)' } : {}

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:flex-shrink-0 lg:h-screen lg:sticky lg:top-0 border-r border-gray-100 bg-white/90 backdrop-blur-sm px-4 py-5">
      <Image src="/fiteasy-logo.png" alt="fiteasy.ro" width={209} height={98} className="h-7 w-auto mb-8" priority />
      <nav className="flex-1 space-y-1">
        <Link href="/dashboard?view=stats" className={item(activeHome)} style={itemStyle(activeHome)}><Home size={17} />Acasă</Link>
        <Link href="/dashboard" className={item(activeClients)} style={itemStyle(activeClients)}><Users size={17} />Clienți</Link>
        {isSuperAdmin && <Link href="/superadmin" className={item(pathname === '/superadmin')} style={itemStyle(pathname === '/superadmin')}><ShieldCheck size={17} />Admin</Link>}
      </nav>
      <button onClick={() => signOut({ callbackUrl: '/login' })} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition"><LogOut size={17} />Deconectare</button>
    </aside>
  )
}
