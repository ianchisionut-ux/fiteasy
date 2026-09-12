'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Image src="/fiteasy-logo.png" alt="fiteasy.ro" width={209} height={98} className="mx-auto h-16 w-auto mb-2" priority />
          <p className="text-sm text-gray-500 mt-1">Creează-ți contul de instructor — gratuit</p>
        </div>
        <form className="card p-5 space-y-3" onSubmit={async e => {
          e.preventDefault(); setBusy(true); setError('')
          const res = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
          const data = await res.json().catch(() => null)
          if (!res.ok) { setError(data?.error || 'Înregistrarea a eșuat.'); setBusy(false); return }
          const result = await signIn('credentials', { email: form.email, password: form.password, redirect: false })
          setBusy(false)
          if (result?.error) { router.push('/login'); return }
          router.push('/dashboard')
        }}>
          <label className="block text-sm">Nume<input required maxLength={150} className="field mt-1" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Numele tău" /></label>
          <label className="block text-sm">Email<input required type="email" className="field mt-1" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="nume@exemplu.ro" /></label>
          <label className="block text-sm">Parolă (minim 8 caractere)<input required minLength={8} type="password" className="field mt-1" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-primary w-full" disabled={busy}>Creează cont</button>
        </form>
        <p className="text-center text-sm text-gray-500">Ai deja cont? <Link href="/login" className="underline" style={{ color: 'var(--accent)' }}>Intră în cont</Link></p>
      </div>
    </main>
  )
}
