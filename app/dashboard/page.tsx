import Workspace from '@/components/workspace'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function DashboardPage() {
  const session = await auth()
  const instructor = await prisma.instructor.findUnique({ where: { id: (session as any)?.instructorId }, select: { name: true } })
  return <Workspace owner instructorName={instructor?.name ?? ''} />
}
