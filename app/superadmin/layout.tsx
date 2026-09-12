import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')
  if (!(session as any).isSuperAdmin) redirect('/dashboard')

  return (
    <div className="app-bg min-h-screen">
    <div className="app-bg-overlay">
      <header className="border-b border-gray-100 bg-white/90 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <span className="font-semibold text-sm">fiteasy — Admin</span>
        <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">Înapoi la dashboard</a>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
    </div>
    </div>
  )
}
