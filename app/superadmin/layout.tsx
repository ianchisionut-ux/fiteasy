import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')
  if (!(session as any).isSuperAdmin) redirect('/dashboard')

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-100 bg-white px-4 py-3 flex items-center justify-between">
        <span className="font-semibold text-sm">fiteasy — Admin</span>
        <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">Înapoi la dashboard</a>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
