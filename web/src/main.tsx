import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import FastApp from './FastApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FastApp />
  </StrictMode>,
)
