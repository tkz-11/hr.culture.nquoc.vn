import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import type { AuthUser } from '../shared/types'

const HomePage = React.lazy(() =>
  import('../features/home/pages/HomePage').then((m) => ({ default: m.HomePage }))
)
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
    <React.Suspense fallback={
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm text-nquoc-muted font-medium">Đang tải...</p>
        </div>
      </div>
    }>
      <Routes>
        <Route path="/" element={<HomePage user={user} />} />
        <Route path="/retention" element={<RetentionPage user={user} />} />
        <Route path="/passport" element={<PassportPage user={user} />} />
        <Route path="/culture" element={<CulturePage user={user} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  )
}
