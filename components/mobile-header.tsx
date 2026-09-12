'use client'

import Image from 'next/image'
import { signOut } from 'next-auth/react'

export default function MobileHeader() {
  return (
    <header className="lg:hidden border-b border-gray-100 bg-white/90 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
      <Image src="/fiteasy-logo.png" alt="fiteasy.ro" width={209} height={98} className="h-7 w-auto" priority />
      <button onClick={() => signOut({ callbackUrl: '/login' })} className="text-sm text-gray-500 hover:text-gray-900">Deconectare</button>
    </header>
  )
}
