import { createRoot } from 'react-dom/client'
import App from './App.tsx'

// Registrar service worker para cache agresivo
if (
  'serviceWorker' in navigator &&
  import.meta.env.PROD &&
  !import.meta.env.VITE_DISABLE_SW &&
  !(window as any).__PW_TEST__
) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <App />
)
