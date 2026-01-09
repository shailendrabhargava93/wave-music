import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Remove pre-hydration splash if present
try {
  const splash = document.getElementById('preload-splash');
  if (splash && splash.parentNode) {
    // Fade out then remove for a smooth transition
    splash.style.transition = 'opacity 300ms ease';
    splash.style.opacity = '0';
    setTimeout(() => splash.remove(), 350);
  }
} catch (err) {
  // ignore
}

// Register PWA Service Worker
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.info('App ready to work offline')
  },
})
