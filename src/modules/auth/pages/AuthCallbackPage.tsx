import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth.store'

export function AuthCallbackPage() {
  const { initialize } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    initialize().then(() => navigate('/', { replace: true }))
  }, [initialize, navigate])

  return (
    <div className="min-h-screen bg-nquoc-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm text-nquoc-muted font-medium">Đang xác thực...</p>
      </div>
    </div>
  )
}
