import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker with auto-update
try {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      console.log('Nowa wersja aplikacji PWA jest dostępna.');
    },
    onOfflineReady() {
      console.log('Aplikacja jest w pełni gotowa do pracy w trybie offline.');
    },
  });
} catch (e) {
  console.warn('PWA service worker registration skipped:', e);
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

