import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const url = process.env.DATABASE_URL
  if (!url) return NextResponse.json({ ok: false, step: 'env', error: 'DATABASE_URL lipsește din process.env' })

  try {
    const sql = neon(url)
    const result = await sql`SELECT 1 as ok`
    const instructors = await prisma.instructor.count()
    return NextResponse.json({ ok: true, result, instructors, urlHost: url.split('@')[1]?.split('/')[0] })
  } catch (e: any) {
    const message = e instanceof Error ? `${e.name}: ${e.message}`
      : e?.message ? String(e.message)
      : JSON.stringify(e, Object.getOwnPropertyNames(e ?? {}))
    return NextResponse.json({ ok: false, step: 'query', error: message, urlHost: url.split('@')[1]?.split('/')[0] })
  }
}
