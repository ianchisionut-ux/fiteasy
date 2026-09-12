'use client'

import { useEffect, useMemo, useState } from 'react'
import { format, subDays, subMonths, subYears } from 'date-fns'
import { Droplet, Footprints, Moon, Plus, TrendingUp } from 'lucide-react'

async function api(url: string, method = 'GET', body?: unknown) {
  const response = await fetch(url, { method, cache: 'no-store', headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined })
  const isJson = response.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await response.json().catch(() => null) : null
  if (!response.ok) throw new Error(data?.error || `Cererea a eșuat (HTTP ${response.status}).`)
  return data ?? {}
}

type Intake = { medicalHistory: string; injuries: string; experienceLevel: string; lifestyle: string; foodPreferences: string; goals: string }
type Measurement = { id: string; date: string; weight: number | null; waist: number | null; hips: number | null; arms: number | null; thighs: number | null; notes: string }
type Habit = { date: string; waterMl: number | null; steps: number | null; sleepHours: number | null }
type CheckIn = { id: string; weekOf: string; avgWeight: number | null; energyLevel: number | null; dietAdherencePercent: number | null; difficulties: string }

const emptyIntake: Intake = { medicalHistory: '', injuries: '', experienceLevel: '', lifestyle: '', foodPreferences: '', goals: '' }

export default function ProgressTab({ owner, query }: { owner: boolean; query: string }) {
  const [intake, setIntake] = useState<Intake>(emptyIntake)
  const [intakeOpen, setIntakeOpen] = useState(false)
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [measurementOpen, setMeasurementOpen] = useState(false)
  const [newMeasurement, setNewMeasurement] = useState({ date: format(new Date(), 'yyyy-MM-dd'), weight: '', waist: '', hips: '', arms: '', thighs: '', notes: '' })
  const [todayHabit, setTodayHabit] = useState<Habit>({ date: format(new Date(), 'yyyy-MM-dd'), waterMl: null, steps: null, sleepHours: null })
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [checkInOpen, setCheckInOpen] = useState(false)
  const [newCheckIn, setNewCheckIn] = useState({ avgWeight: '', energyLevel: '3', dietAdherencePercent: '', difficulties: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [range, setRange] = useState<'7' | '30' | '90' | '180' | '365' | 'all'>('30')

  async function action(fn: () => Promise<void>) {
    setBusy(true); setError('')
    try { await fn() } catch (e) { setError(e instanceof Error ? e.message : 'A apărut o eroare.') }
    finally { setBusy(false) }
  }

  useEffect(() => {
    void action(async () => {
      const [i, m, c] = await Promise.all([
        api(`/api/intake?${query}`),
        api(`/api/measurements?${query}`),
        api(`/api/checkins?${query}`),
      ])
      if (i.intake) setIntake(i.intake)
      setMeasurements(m.measurements)
      setCheckIns(c.checkIns)
      const today = format(new Date(), 'yyyy-MM-dd')
      const h = await api(`/api/habits?${query}&from=${today}&to=${today}`)
      if (h.habits?.[0]) setTodayHabit(h.habits[0])
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const first = measurements[0]
  const latest = measurements[measurements.length - 1]
  const weekOf = format(new Date(), 'yyyy-MM-dd')

  const weightSeries = useMemo(() => {
    const cutoff = range === 'all' ? null
      : range === '365' ? subYears(new Date(), 1)
      : range === '180' ? subMonths(new Date(), 6)
      : range === '90' ? subMonths(new Date(), 3)
      : subDays(new Date(), Number(range))
    return measurements.filter(m => m.weight != null && (!cutoff || new Date(`${m.date}T12:00:00`) >= cutoff))
  }, [measurements, range])

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="card p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Anamneză</h2>
          {!intakeOpen && <button className="text-xs underline" style={{ color: 'var(--accent)' }} onClick={() => setIntakeOpen(true)}>{intake.goals || intake.medicalHistory ? 'Editează' : owner ? 'Vezi' : 'Completează'}</button>}
        </div>
        {!intakeOpen && (intake.goals || intake.medicalHistory) && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{intake.goals || intake.medicalHistory}</p>}
        {intakeOpen && (
          <form className="space-y-3 mt-3" onSubmit={e => { e.preventDefault(); void action(async () => { const d = await api(`/api/intake?${query}`, 'PUT', intake); setIntake(d.intake); setIntakeOpen(false) }) }}>
            <label className="block text-xs">Nivel de experiență
              <select className="field mt-1" value={intake.experienceLevel} onChange={e => setIntake({ ...intake, experienceLevel: e.target.value })} disabled={owner}>
                <option value="">Alege</option><option value="ÎNCEPĂTOR">Începător</option><option value="INTERMEDIAR">Intermediar</option><option value="AVANSAT">Avansat</option>
              </select>
            </label>
            <label className="block text-xs">Obiective<textarea className="field mt-1" rows={2} maxLength={2000} value={intake.goals} onChange={e => setIntake({ ...intake, goals: e.target.value })} disabled={owner} /></label>
            <label className="block text-xs">Istoric medical<textarea className="field mt-1" rows={2} maxLength={4000} value={intake.medicalHistory} onChange={e => setIntake({ ...intake, medicalHistory: e.target.value })} disabled={owner} /></label>
            <label className="block text-xs">Accidentări<textarea className="field mt-1" rows={2} maxLength={4000} value={intake.injuries} onChange={e => setIntake({ ...intake, injuries: e.target.value })} disabled={owner} /></label>
            <label className="block text-xs">Stil de viață<textarea className="field mt-1" rows={2} maxLength={4000} value={intake.lifestyle} onChange={e => setIntake({ ...intake, lifestyle: e.target.value })} disabled={owner} /></label>
            <label className="block text-xs">Preferințe alimentare<textarea className="field mt-1" rows={2} maxLength={2000} value={intake.foodPreferences} onChange={e => setIntake({ ...intake, foodPreferences: e.target.value })} disabled={owner} /></label>
            <div className="flex gap-2">
              {!owner && <button className="btn-primary" disabled={busy}>Salvează</button>}
              <button type="button" className="btn-secondary" onClick={() => setIntakeOpen(false)}>Închide</button>
            </div>
          </form>
        )}
      </div>

      {!owner && (
        <div className="card p-4">
          <h2 className="text-sm font-semibold mb-3">Obiceiuri azi</h2>
          <div className="grid grid-cols-3 gap-3">
            <label className="text-center">
              <Droplet size={18} className="mx-auto mb-1" style={{ color: 'var(--accent)' }} />
              <input type="number" className="field text-center text-sm" placeholder="ml" value={todayHabit.waterMl ?? ''} onChange={e => setTodayHabit({ ...todayHabit, waterMl: e.target.value ? Number(e.target.value) : null })} />
              <span className="text-[10px] text-gray-400">apă (ml)</span>
            </label>
            <label className="text-center">
              <Footprints size={18} className="mx-auto mb-1" style={{ color: 'var(--accent)' }} />
              <input type="number" className="field text-center text-sm" placeholder="pași" value={todayHabit.steps ?? ''} onChange={e => setTodayHabit({ ...todayHabit, steps: e.target.value ? Number(e.target.value) : null })} />
              <span className="text-[10px] text-gray-400">pași</span>
            </label>
            <label className="text-center">
              <Moon size={18} className="mx-auto mb-1" style={{ color: 'var(--accent)' }} />
              <input type="number" step="0.5" className="field text-center text-sm" placeholder="ore" value={todayHabit.sleepHours ?? ''} onChange={e => setTodayHabit({ ...todayHabit, sleepHours: e.target.value ? Number(e.target.value) : null })} />
              <span className="text-[10px] text-gray-400">somn (h)</span>
            </label>
          </div>
          <button className="btn-primary w-full mt-3 text-sm" disabled={busy} onClick={() => action(async () => { await api(`/api/habits?${query}`, 'PUT', todayHabit) })}>Salvează</button>
        </div>
      )}

      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold">Măsurători corporale</h2>
          <button className="text-xs underline flex items-center gap-1" style={{ color: 'var(--accent)' }} onClick={() => setMeasurementOpen(o => !o)}><Plus size={13} />Adaugă</button>
        </div>
        {measurementOpen && (
          <form className="grid grid-cols-2 gap-2 mb-3" onSubmit={e => {
            e.preventDefault(); void action(async () => {
              const payload: any = { date: newMeasurement.date, notes: newMeasurement.notes }
              for (const k of ['weight', 'waist', 'hips', 'arms', 'thighs'] as const) if (newMeasurement[k]) payload[k] = Number(newMeasurement[k])
              await api(`/api/measurements?${query}`, 'POST', payload)
              const d = await api(`/api/measurements?${query}`); setMeasurements(d.measurements); setMeasurementOpen(false)
            })
          }}>
            <input type="date" className="field col-span-2" value={newMeasurement.date} onChange={e => setNewMeasurement({ ...newMeasurement, date: e.target.value })} />
            <input type="number" step="0.1" placeholder="Greutate (kg)" className="field" value={newMeasurement.weight} onChange={e => setNewMeasurement({ ...newMeasurement, weight: e.target.value })} />
            <input type="number" step="0.1" placeholder="Talie (cm)" className="field" value={newMeasurement.waist} onChange={e => setNewMeasurement({ ...newMeasurement, waist: e.target.value })} />
            <input type="number" step="0.1" placeholder="Șolduri (cm)" className="field" value={newMeasurement.hips} onChange={e => setNewMeasurement({ ...newMeasurement, hips: e.target.value })} />
            <input type="number" step="0.1" placeholder="Brațe (cm)" className="field" value={newMeasurement.arms} onChange={e => setNewMeasurement({ ...newMeasurement, arms: e.target.value })} />
            <input type="number" step="0.1" placeholder="Coapse (cm)" className="field" value={newMeasurement.thighs} onChange={e => setNewMeasurement({ ...newMeasurement, thighs: e.target.value })} />
            <button className="btn-primary col-span-2 text-sm" disabled={busy}>Salvează măsurătoarea</button>
          </form>
        )}
        {measurements.length === 0 && <p className="text-sm text-gray-400">Nicio măsurătoare încă.</p>}

        {weightSeries.length >= 2 && (() => {
          const weights = weightSeries.map(m => m.weight as number)
          const min = Math.min(...weights), max = Math.max(...weights)
          const span = max - min || 1
          const w = 300, h = 80, pad = 4
          const points = weightSeries.map((m, i) => {
            const x = weightSeries.length > 1 ? (i / (weightSeries.length - 1)) * w : 0
            const y = pad + (1 - (weights[i] - min) / span) * (h - 2 * pad)
            return `${x},${y}`
          }).join(' ')
          const diff = weights[weights.length - 1] - weights[0]
          return (
            <div className="mb-3">
              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <span className="text-lg font-semibold">{weights[weights.length - 1]}kg</span>
                  <span className={`text-xs ml-2 ${diff <= 0 ? 'text-green-600' : 'text-amber-600'}`}>{diff > 0 ? '+' : ''}{diff.toFixed(1)}kg</span>
                </div>
                <span className="text-[11px] text-gray-400">{weightSeries[0].date} → {weightSeries[weightSeries.length - 1].date}</span>
              </div>
              <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
                <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth="2" />
              </svg>
              <div className="flex gap-1 mt-2">
                {([['7', '1S'], ['30', '1L'], ['90', '3L'], ['180', '6L'], ['365', '1A'], ['all', 'Tot']] as const).map(([key, label]) => (
                  <button key={key} onClick={() => setRange(key)} className="flex-1 text-[11px] py-1 rounded-lg" style={range === key ? { background: 'var(--ink)', color: 'white' } : { background: '#F1F5F3', color: '#6B7280' }}>{label}</button>
                ))}
              </div>
            </div>
          )
        })()}

        {measurements.length > 0 && (
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {[...measurements].reverse().map(m => (
              <div key={m.id} className="flex justify-between text-xs text-gray-600 py-1 border-b border-gray-50 last:border-0">
                <span>{m.date}</span>
                <span>{[m.weight && `${m.weight}kg`, m.waist && `talie ${m.waist}cm`, m.hips && `șolduri ${m.hips}cm`].filter(Boolean).join(' · ') || '—'}</span>
              </div>
            ))}
          </div>
        )}

        {first && latest && first.id !== latest.id && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs font-medium mb-2" style={{ color: 'var(--accent)' }}><TrendingUp size={13} />Evoluție față de prima măsurătoare ({first.date})</div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              {first.weight && latest.weight && <div>Greutate: {(latest.weight - first.weight).toFixed(1)}kg</div>}
              {first.waist && latest.waist && <div>Talie: {(latest.waist - first.waist).toFixed(1)}cm</div>}
              {first.hips && latest.hips && <div>Șolduri: {(latest.hips - first.hips).toFixed(1)}cm</div>}
              {first.arms && latest.arms && <div>Brațe: {(latest.arms - first.arms).toFixed(1)}cm</div>}
            </div>
          </div>
        )}
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold">Check-in săptămânal</h2>
          {!owner && <button className="text-xs underline flex items-center gap-1" style={{ color: 'var(--accent)' }} onClick={() => setCheckInOpen(o => !o)}><Plus size={13} />Trimite pentru săptămâna asta</button>}
        </div>
        {checkInOpen && (
          <form className="grid grid-cols-2 gap-2 mb-3" onSubmit={e => {
            e.preventDefault(); void action(async () => {
              const payload: any = { weekOf, energyLevel: Number(newCheckIn.energyLevel), difficulties: newCheckIn.difficulties }
              if (newCheckIn.avgWeight) payload.avgWeight = Number(newCheckIn.avgWeight)
              if (newCheckIn.dietAdherencePercent) payload.dietAdherencePercent = Number(newCheckIn.dietAdherencePercent)
              await api(`/api/checkins?${query}`, 'POST', payload)
              const d = await api(`/api/checkins?${query}`); setCheckIns(d.checkIns); setCheckInOpen(false)
            })
          }}>
            <input type="number" step="0.1" placeholder="Greutate medie (kg)" className="field" value={newCheckIn.avgWeight} onChange={e => setNewCheckIn({ ...newCheckIn, avgWeight: e.target.value })} />
            <input type="number" min="0" max="100" placeholder="Aderență dietă (%)" className="field" value={newCheckIn.dietAdherencePercent} onChange={e => setNewCheckIn({ ...newCheckIn, dietAdherencePercent: e.target.value })} />
            <label className="col-span-2 text-xs">Nivel de energie (1-5)
              <input type="range" min="1" max="5" className="w-full" value={newCheckIn.energyLevel} onChange={e => setNewCheckIn({ ...newCheckIn, energyLevel: e.target.value })} />
            </label>
            <textarea placeholder="Dificultăți întâmpinate" className="field col-span-2" rows={2} value={newCheckIn.difficulties} onChange={e => setNewCheckIn({ ...newCheckIn, difficulties: e.target.value })} />
            <button className="btn-primary col-span-2 text-sm" disabled={busy}>Trimite</button>
          </form>
        )}
        {checkIns.length === 0 && <p className="text-sm text-gray-400">Niciun check-in încă.</p>}
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {checkIns.map(c => (
            <div key={c.id} className="text-xs text-gray-600 py-1 border-b border-gray-50 last:border-0">
              <span className="font-medium">{c.weekOf}</span> — {[c.avgWeight && `${c.avgWeight}kg`, c.dietAdherencePercent != null && `${c.dietAdherencePercent}% aderență`, c.energyLevel && `energie ${c.energyLevel}/5`].filter(Boolean).join(' · ')}
              {c.difficulties && <p className="text-gray-500 mt-0.5">{c.difficulties}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
