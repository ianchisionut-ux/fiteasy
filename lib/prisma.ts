import { PrismaClient } from '@prisma/client'
import { PrismaNeonHTTP } from '@prisma/adapter-neon'

// HTTP mode is stateless and works consistently in both Vercel Functions and
// Cloudflare Workers. Multi-statement operations use Neon's HTTP transaction
// API directly in the two routes that need them.
const adapter = new PrismaNeonHTTP(process.env.DATABASE_URL ?? '', {})

export const prisma = new PrismaClient({ adapter })
