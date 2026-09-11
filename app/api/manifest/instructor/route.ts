import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    name: 'fiteasy — Instructor',
    short_name: 'fiteasy',
    description: 'Planuri, antrenamente și mesaje cu clienții tăi.',
    start_url: '/dashboard',
    scope: '/dashboard',
    display: 'standalone',
    background_color: '#FAFAF8',
    theme_color: '#0F6E56',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }, { headers: { 'Cache-Control': 'public, max-age=3600' } })
}
