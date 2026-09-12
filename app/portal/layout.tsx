import Image from 'next/image'
import PwaInstall from '@/components/pwa-install'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'fiteasy — Planul meu',
  manifest: '/api/manifest/client',
  appleWebApp: { capable: true, title: 'fiteasy', statusBarStyle: 'default' },
}
export const viewport: Viewport = { themeColor: '#0F6E56' }

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-bg min-h-screen">
    <div className="app-bg-overlay">
      <header className="border-b border-gray-100 bg-white/90 backdrop-blur-sm px-4 py-3">
        <Image src="/fiteasy-logo.png" alt="fiteasy.ro" width={209} height={98} className="h-7 w-auto" priority />
      </header>
      <PwaInstall label="fiteasy" />
      <main className="max-w-lg mx-auto px-4 py-6">{children}</main>
    </div>
    </div>
  )
}
