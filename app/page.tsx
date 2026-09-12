import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, MessageCircle, Sparkles, TrendingUp } from 'lucide-react'
import AnimatedPreview from '@/components/animated-preview'

export default function HomePage() {
  return (
    <main className="min-h-screen relative isolate">
      {/* Fundal: fotografie monocromă cu vinietă, pe tot ecranul */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/hero-gym.jpg"
          alt=""
          fill
          priority
          className="object-cover"
          style={{ filter: 'grayscale(1) contrast(1.05) brightness(0.55)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.75) 100%)',
          }}
        />
      </div>

      <header className="px-4 py-4 flex items-center justify-between max-w-5xl mx-auto relative z-10">
        <Image src="/fiteasy-logo.png" alt="fiteasy.ro" width={209} height={98} className="h-8 w-auto brightness-0 invert" priority />
        <div className="flex gap-2">
          <Link href="/login" className="text-sm px-4 py-2 rounded-full text-white border border-white/40 hover:bg-white/10 transition">Intră în cont</Link>
          <Link href="/register" className="btn-primary text-sm">Începe gratuit</Link>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 py-24 text-center relative z-10">
        <h1 className="text-3xl sm:text-5xl font-semibold mb-4 text-white">Platforma ta de coaching, într-un singur loc</h1>
        <p className="text-white/80 text-lg mb-8">Planuri de antrenament, nutriție, mesaje și apeluri video cu clienții tăi — fără hârtii, fără Excel, fără WhatsApp răzleț.</p>
        <div className="flex justify-center gap-3">
          <Link href="/register" className="btn-primary">Creează cont gratuit</Link>
          <Link href="/login" className="text-sm px-5 py-2.5 rounded-full text-white border border-white/40 hover:bg-white/10 transition">Am deja cont</Link>
        </div>
      </section>

      <div className="px-6 pb-16 relative z-10">
        <AnimatedPreview />
      </div>

      <section className="max-w-5xl mx-auto px-6 pb-24 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {[
          { icon: CalendarDays, title: 'Calendar mare', text: 'Programează antrenamente și mese direct pe un calendar cu drag-and-drop.' },
          { icon: Sparkles, title: 'Exemple gata făcute', text: 'Programe de antrenament și zile de nutriție predefinite, plus șabloanele tale.' },
          { icon: TrendingUp, title: 'Progres vizibil', text: 'Măsurători, ținte de macro-uri și evoluție în timp, pentru fiecare client.' },
          { icon: MessageCircle, title: 'Mesaje și video', text: 'Chat direct cu clienții și apeluri video Jitsi, fără aplicații în plus.' },
        ].map(f => (
          <div key={f.title} className="rounded-2xl p-5 backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <f.icon size={20} className="mb-3 text-white" />
            <h3 className="font-medium mb-1 text-white">{f.title}</h3>
            <p className="text-sm text-white/70">{f.text}</p>
          </div>
        ))}
      </section>

      <footer className="text-center text-xs text-white/50 pb-8 relative z-10">© {new Date().getFullYear()} fiteasy.ro</footer>
    </main>
  )
}
