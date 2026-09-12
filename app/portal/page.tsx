import { Suspense } from 'react'
import Workspace from '@/components/workspace'

export default function PortalPage() {
  return (
    <Suspense>
      <Workspace />
    </Suspense>
  )
}
