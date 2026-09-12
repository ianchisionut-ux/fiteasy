'use client'

import { useEffect, useState } from 'react'
import { Shield, Users } from 'lucide-react'

type Instructor = { id: string; name: string; email: string; active: boolean; isSuperAdmin: boolean; createdAt: string; _count: { clients: number } }

export default function SuperadminPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')

  useEffect(() => {
    fetch('/api/superadmin/instructors').then(r => r.json()).then(d => {
      if (d.error) setError(d.error); else setInstructors(d.instructors)
    })
  }, [])

  async function toggle(instructorId: string, active: boolean) {
    setBusy(instructorId); setError('')
    const res = await fetch('/api/superadmin/instructors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ instructorId, active }) })
    const data = await res.json().catch(() => null)
    setBusy('')
    if (!res.ok) { setError(data?.error || 'Acțiune eșuată.'); return }
    setInstructors(list => list.map(i => i.id === instructorId ? { ...i, active } : i))
  }

  const activeCount = instructors.filter(i => i.active).length

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Instructori</h1>
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4"><p className="text-xs text-gray-500">Total instructori</p><p className="text-xl font-semibold mt-1">{instructors.length}</p></div>
        <div className="card p-4"><p className="text-xs text-gray-500">Conturi active</p><p className="text-xl font-semibold mt-1">{activeCount}</p></div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="card divide-y divide-gray-100">
        {instructors.map(i => (
          <div key={i.id} className="p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0" style={{ background: 'var(--accent)' }}>
              {i.name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate flex items-center gap-1.5">{i.name}{i.isSuperAdmin && <Shield size={12} style={{ color: 'var(--accent)' }} />}</p>
              <p className="text-xs text-gray-500 truncate">{i.email} · <Users size={11} className="inline" /> {i._count.clients} clienți</p>
            </div>
            {!i.isSuperAdmin && (
              <button disabled={busy === i.id} onClick={() => toggle(i.id, !i.active)} className="text-xs px-3 py-1.5 rounded-full flex-shrink-0" style={i.active ? { border: '1px solid #FCA5A5', color: '#DC2626' } : { background: 'var(--accent)', color: 'white' }}>
                {i.active ? 'Dezactivează' : 'Activează'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
