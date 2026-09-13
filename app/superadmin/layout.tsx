import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SidebarNav from '@/components/sidebar-nav'
import DesktopTopbar from '@/components/desktop-topbar'

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')
  if (!(session as any).isSuperAdmin) redirect('/dashboard')

  return (
    <div className="app-bg min-h-screen">
    <div className="app-bg-overlay lg:flex">
      <SidebarNav isSuperAdmin />
      <div className="flex-1 min-w-0"><DesktopTopbar instructorName={(session as any)?.user?.name ?? 'Superadmin'} />
      <main className="dashboard-main">{children}</main></div>
    </div>
    </div>
  )
}
