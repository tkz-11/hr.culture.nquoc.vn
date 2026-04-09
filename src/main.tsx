import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

async function prepare() {
  const isVercelPreview = window.location.hostname.includes('vercel.app')
  const isDemoMode = new URLSearchParams(window.location.search).has('demo')

  if (import.meta.env.DEV || isVercelPreview || isDemoMode) {
    const { worker } = await import('./mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }
}

prepare().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
})
