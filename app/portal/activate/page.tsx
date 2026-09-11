'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ActivatePage() {
  const router = useRouter()
  const [error, setError] = useState('')

  useEffect(() => {
    const token = window.location.hash.slice(1)
    if (!token) { setError('Link invalid. Solicită unul nou instructorului.'); return }
    fetch('/api/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
      .then(async res => {
        if (!res.ok) { const d = await res.json().catch(() => null); throw new Error(d?.error || 'Activare eșuată.') }
        router.replace('/portal')
      })
      .catch(e => setError(e.message))
  }, [router])

  return (
    <div className="text-center py-12">
      {error ? <p className="text-sm text-red-600">{error}</p> : <p className="text-sm text-gray-500">Se activează accesul…</p>}
    </div>
  )
}
