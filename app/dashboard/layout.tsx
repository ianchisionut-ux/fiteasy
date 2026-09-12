import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import PwaInstall from '@/components/pwa-install'
import SidebarNav from '@/components/sidebar-nav'
import MobileHeader from '@/components/mobile-header'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'fiteasy — Instructor',
  manifest: '/api/manifest/instructor',
  appleWebApp: { capable: true, title: 'fiteasy Instructor', statusBarStyle: 'default' },
}
export const viewport: Viewport = { themeColor: '#0F6E56' }

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="app-bg min-h-screen">
    <div className="app-bg-overlay lg:flex">
      <Suspense>
        <SidebarNav isSuperAdmin={Boolean((session as any).isSuperAdmin)} />
      </Suspense>
      <div className="flex-1 min-w-0">
        <MobileHeader />
        <PwaInstall label="fiteasy Instructor" />
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      </div>
    </div>
    </div>
  )
}
