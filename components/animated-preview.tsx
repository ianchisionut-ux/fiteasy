'use client'

export default function AnimatedPreview() {
  const r = 70, c = 2 * Math.PI * r

  return (
    <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl" style={{ height: 420 }}>
      <div className="absolute inset-0">
        <div className="w-full h-full p-8 flex flex-col gap-6" style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24 }}>
          <div>
            <p className="text-white/60 text-sm">Bună dimineața</p>
            <p className="text-white text-2xl font-semibold">Bine ai revenit!</p>
          </div>

          <div className="flex gap-8 items-center">
            <svg width="160" height="160" viewBox="0 0 160 160" className="flex-shrink-0">
              <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="12" />
              <circle
                cx="80" cy="80" r={r} fill="none" stroke="#22c55e" strokeWidth="12" strokeLinecap="round"
                strokeDasharray={c}
                transform="rotate(-90 80 80)"
                className="preview-ring"
              />
              <text x="80" y="76" textAnchor="middle" fontSize="28" fontWeight="600" fill="white">87%</text>
              <text x="80" y="98" textAnchor="middle" fontSize="12" fill="rgba(255,255,255,0.6)">completat azi</text>
            </svg>

            <div className="flex-1 space-y-3">
              {[['Antrenamente', '#22c55e'], ['Nutriție', '#06b6d4'], ['Progres', '#a855f7']].map(([label, color]) => (
                <div key={label} className="flex items-center gap-2 text-sm text-white/80">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <p className="text-white/60 text-xs mb-3">Evoluție săptămânală</p>
            <svg width="100%" height="90" viewBox="0 0 320 90" preserveAspectRatio="none">
              <polyline
                points="0,70 40,40 80,75 120,55 160,20 200,45 240,15 280,35 320,10"
                fill="none" stroke="#22c55e" strokeWidth="2.5"
                pathLength={1}
                className="preview-line"
              />
            </svg>
          </div>
        </div>
      </div>

      <style>{`
        .preview-ring {
          stroke-dashoffset: ${c};
          animation: previewRing 1.4s ease-out forwards;
        }
        @keyframes previewRing {
          to { stroke-dashoffset: ${c * (1 - 0.87)}; }
        }
        .preview-line {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: previewLine 1.6s ease-out 0.2s forwards;
        }
        @keyframes previewLine {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  )
}
