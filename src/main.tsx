import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

try {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      // Auto-reload to activate latest version as soon as GitHub updates
      updateSW(true);
    },
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
        // Auto-check for GitHub updates periodically
        setInterval(() => {
          registration.update().catch(() => {});
        }, 60 * 1000);
      }
    },
  });
} catch {
  // Ignore if Service Worker is unsupported in restricted embed contexts
}

// Prevent browser copy popup / context callout on long press on buttons & UI
if (typeof window !== 'undefined') {
  window.addEventListener(
    'contextmenu',
    (e) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) {
        return;
      }
      e.preventDefault();
    },
    { passive: false }
  );
}

// Ask browser to protect offline IndexedDB & Cache Storage from automatic eviction
if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
  navigator.storage.persist().catch(() => {});
}

createRoot(document.getElementById('root')!).render(<App />);
