import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import type { AuthUser } from '../shared/types'

const RetentionPage = React.lazy(() =>
  import('../features/retention/pages/RetentionPage').then((m) => ({ default: m.RetentionPage }))
)
const PassportPage = React.lazy(() =>
  import('../features/passport/pages/PassportPage').then((m) => ({ default: m.PassportPage }))
)
const CulturePage = React.lazy(() =>
  import('../features/culture/pages/CulturePage').then((m) => ({ default: m.CulturePage }))
)

interface AppRoutesProps {
  user: AuthUser
}

export function AppRoutes({ user }: AppRoutesProps) {
  return (
    <React.Suspense fallback={<div className="flex-1 flex items-center justify-center text-nquoc-muted text-sm">Đang tải...</div>}>
      <Routes>
        <Route path="/" element={<Navigate to="/retention" replace />} />
        <Route path="/retention" element={<RetentionPage user={user} />} />
        <Route path="/passport" element={<PassportPage user={user} />} />
        <Route path="/culture" element={<CulturePage user={user} />} />
        <Route path="*" element={<Navigate to="/retention" replace />} />
      </Routes>
    </React.Suspense>
  )
}
