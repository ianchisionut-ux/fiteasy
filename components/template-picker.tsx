'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Sparkles } from 'lucide-react'
import { WORKOUT_PROGRAMS, NUTRITION_DAYS } from '@/lib/templates'

async function api(url: string, method = 'GET', body?: unknown) {
  const response = await fetch(url, { method, cache: 'no-store', headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined })
  const isJson = response.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await response.json().catch(() => null) : null
  if (!response.ok) throw new Error(data?.error || `Cererea a eșuat (HTTP ${response.status}).`)
  return data ?? {}
}

type CustomTemplate = { id: string; name: string }

export default function TemplatePicker({ kind, query, onApplied }: { kind: 'WORKOUT' | 'NUTRITION'; query: string; onApplied: () => void }) {
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState<CustomTemplate[]>([])
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) api(`/api/templates?kind=${kind}`).then(d => setCustom(d.templates)).catch(() => {})
  }, [open, kind])

  const builtIns = kind === 'WORKOUT' ? WORKOUT_PROGRAMS : NUTRITION_DAYS

  async function apply(source: 'built-in' | 'custom', templateId: string) {
    setBusy(true); setError('')
    try {
      await api(`/api/entries/apply-template?${query}`, 'POST', { kind, source, templateId, startDate })
      setOpen(false)
      onApplied()
    } catch (e) { setError(e instanceof Error ? e.message : 'Nu am putut aplica șablonul.') }
    finally { setBusy(false) }
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} className="btn-secondary flex items-center gap-1.5 text-sm">
      <Sparkles size={15} />Alege din exemple
    </button>
  )

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Alege un {kind === 'WORKOUT' ? 'program de antrenament' : 'exemplu de zi de nutriție'}</h3>
        <button className="text-xs text-gray-400" onClick={() => setOpen(false)}>Închide</button>
      </div>
      <label className="block text-xs">Data de start<input type="date" className="field mt-1" value={startDate} onChange={e => setStartDate(e.target.value)} /></label>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <p className="text-xs text-gray-500 mb-1.5">Exemple predefinite</p>
        <div className="space-y-1.5">
          {builtIns.map(t => (
            <button key={t.id} disabled={busy} onClick={() => apply('built-in', t.id)} className="w-full text-left rounded-xl border border-gray-200 p-2.5 hover:bg-gray-50 disabled:opacity-50">
              <div className="text-sm font-medium">{t.name}</div>
              <div className="text-xs text-gray-500">{t.description}</div>
            </button>
          ))}
        </div>
      </div>

      {custom.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-1.5">Exemplele tale</p>
          <div className="space-y-1.5">
            {custom.map(t => (
              <button key={t.id} disabled={busy} onClick={() => apply('custom', t.id)} className="w-full text-left rounded-xl border border-gray-200 p-2.5 hover:bg-gray-50 disabled:opacity-50">
                <div className="text-sm font-medium">{t.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
