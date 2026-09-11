'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PwaInstall({ label }: { label: string }) {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {})
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    if (standalone || sessionStorage.getItem('fiteasy-pwa-dismissed')) setDismissed(true)
    const handler = (e: Event) => { e.preventDefault(); setPrompt(e as BeforeInstallPromptEvent) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (dismissed || !prompt) return null

  return (
    <div className="mx-4 mt-3 lg:mx-8 rounded-2xl border border-gray-200 bg-white px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm">
        <Download size={16} style={{ color: 'var(--accent)' }} />
        Instalează {label} pe telefon — rămâi conectat mai ușor
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button className="btn-primary text-xs py-1.5 px-3" onClick={async () => {
          await prompt.prompt()
          await prompt.userChoice
          setPrompt(null)
        }}>Instalează</button>
        <button aria-label="Închide" onClick={() => { sessionStorage.setItem('fiteasy-pwa-dismissed', '1'); setDismissed(true) }} className="text-gray-400"><X size={16} /></button>
      </div>
    </div>
  )
}
