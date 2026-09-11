import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'fiteasy.ro',
  description: 'Antrenamente, nutriție și mesaje — pentru instructori și clienții lor.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  )
}
