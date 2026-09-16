import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.DATABASE_URL
  if (!url) return NextResponse.json({ ok: false, step: 'env', error: 'DATABASE_URL lipsește din process.env' })

  try {
    const sql = neon(url)
    const result = await sql`SELECT 1 as ok`
    return NextResponse.json({ ok: true, result, urlHost: url.split('@')[1]?.split('/')[0] })
  } catch (e: any) {
    const message = e instanceof Error ? `${e.name}: ${e.message}`
      : e?.message ? String(e.message)
      : JSON.stringify(e, Object.getOwnPropertyNames(e ?? {}))
    return NextResponse.json({ ok: false, step: 'query', error: message, urlHost: url.split('@')[1]?.split('/')[0] })
  }
}
