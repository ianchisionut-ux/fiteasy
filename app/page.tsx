import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, MessageCircle, Sparkles, TrendingUp } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="px-4 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <Image src="/fiteasy-logo.png" alt="fiteasy.ro" width={209} height={98} className="h-8 w-auto" priority />
        <div className="flex gap-2">
          <Link href="/login" className="btn-secondary text-sm">Intră în cont</Link>
          <Link href="/register" className="btn-primary text-sm">Începe gratuit</Link>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl sm:text-4xl font-semibold mb-4">Platforma ta de coaching, într-un singur loc</h1>
        <p className="text-gray-600 text-lg mb-8">Planuri de antrenament, nutriție, mesaje și apeluri video cu clienții tăi — fără hârtii, fără Excel, fără WhatsApp răzleț.</p>
        <div className="flex justify-center gap-3">
          <Link href="/register" className="btn-primary">Creează cont gratuit</Link>
          <Link href="/login" className="btn-secondary">Am deja cont</Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: CalendarDays, title: 'Calendar mare', text: 'Programează antrenamente și mese direct pe un calendar cu drag-and-drop.' },
          { icon: Sparkles, title: 'Exemple gata făcute', text: 'Programe de antrenament și zile de nutriție predefinite, plus șabloanele tale.' },
          { icon: TrendingUp, title: 'Progres vizibil', text: 'Măsurători, ținte de macro-uri și evoluție în timp, pentru fiecare client.' },
          { icon: MessageCircle, title: 'Mesaje și video', text: 'Chat direct cu clienții și apeluri video Jitsi, fără aplicații în plus.' },
        ].map(f => (
          <div key={f.title} className="card p-5">
            <f.icon size={20} style={{ color: 'var(--accent)' }} className="mb-3" />
            <h3 className="font-medium mb-1">{f.title}</h3>
            <p className="text-sm text-gray-500">{f.text}</p>
          </div>
        ))}
      </section>

      <footer className="text-center text-xs text-gray-400 pb-8">© {new Date().getFullYear()} fiteasy.ro</footer>
    </main>
  )
}
