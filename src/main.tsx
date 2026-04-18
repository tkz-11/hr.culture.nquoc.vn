// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { enableMocking } from './mocks/init'
import './index.css'

async function bootstrap() {
  await enableMocking()
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode><App /></React.StrictMode>
  )
}
bootstrap()
