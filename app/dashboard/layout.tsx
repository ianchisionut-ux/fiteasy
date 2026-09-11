import Image from 'next/image'
import { auth, signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-100 bg-white px-4 py-3 flex items-center justify-between">
        <Image src="/fiteasy-logo.png" alt="fiteasy.ro" width={209} height={98} className="h-7 w-auto" priority />
        <form action={async () => { 'use server'; await signOut({ redirectTo: '/login' }) }}>
          <button className="text-sm text-gray-500 hover:text-gray-900">Deconectare</button>
        </form>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
