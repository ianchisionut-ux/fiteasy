'use client'

import Image from 'next/image'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Image src="/fiteasy-logo.png" alt="fiteasy.ro" width={209} height={98} className="mx-auto h-16 w-auto mb-2" priority />
          <p className="text-sm text-gray-500 mt-1">Intră în contul de instructor</p>
        </div>
        <form className="card p-5 space-y-3" onSubmit={async e => {
          e.preventDefault(); setBusy(true); setError('')
          const result = await signIn('credentials', { email, password, redirect: false })
          setBusy(false)
          if (result?.error) setError('Email sau parolă greșite.')
          else router.push('/dashboard')
        }}>
          <label className="block text-sm">Email<input required type="email" className="field mt-1" value={email} onChange={e => setEmail(e.target.value)} placeholder="nume@exemplu.ro" /></label>
          <label className="block text-sm">Parolă<input required type="password" className="field mt-1" value={password} onChange={e => setPassword(e.target.value)} /></label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-primary w-full" disabled={busy}>Intră în cont</button>
        </form>
      </div>
    </main>
  )
}
