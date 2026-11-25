import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './styles.css'

const rootElement = document.getElementById('root')
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')

if (!rootElement) {
  throw new Error('Elemento #root não encontrado')
}

/** O 404 do Pages entrega `?/<caminho>`; restaura a URL antes do React Router. */
function restoreDeepLink(): void {
  const target = new URLSearchParams(window.location.search).get('/')

  if (!target || !target.startsWith('/') || target.startsWith('//') || target.startsWith('/\\')) {
    return
  }

  window.history.replaceState(null, '', `${basePath}${target}`)
}

restoreDeepLink()

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter basename={basePath || '/'}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
