import Image from 'next/image'
import { auth, signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'
import PwaInstall from '@/components/pwa-install'
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
    <div className="app-bg-overlay">
      <header className="border-b border-gray-100 bg-white/90 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <Image src="/fiteasy-logo.png" alt="fiteasy.ro" width={209} height={98} className="h-7 w-auto" priority />
        <div className="flex items-center gap-3">
          {(session as any).isSuperAdmin && <a href="/superadmin" className="text-sm text-gray-500 hover:text-gray-900">Admin</a>}
          <form action={async () => { 'use server'; await signOut({ redirectTo: '/login' }) }}>
            <button className="text-sm text-gray-500 hover:text-gray-900">Deconectare</button>
          </form>
        </div>
      </header>
      <PwaInstall label="fiteasy Instructor" />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
    </div>
  )
}
