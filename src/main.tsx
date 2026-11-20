import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

try {
  registerSW({
    immediate: true,
    onOfflineReady() {
      try {
        localStorage.setItem('zk_sw_offline_ready', '1');
        window.dispatchEvent(new CustomEvent('zk-offline-ready'));
      } catch {
        // ignore
      }
    },
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        registration.update().catch(() => {});
      }
    },
  });
} catch {
  // Ignore if Service Worker is unsupported in restricted embed contexts
}

// Ask browser to protect offline IndexedDB & Cache Storage from automatic eviction
if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
  navigator.storage.persist().catch(() => {});
}

createRoot(document.getElementById('root')!).render(<App />);
