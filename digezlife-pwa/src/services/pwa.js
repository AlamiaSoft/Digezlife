import { pushToast } from '../state/store.js';

let deferredInstallPrompt = null;

export function initPwa() {
  registerServiceWorker();
  captureInstallPrompt();
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateBanner(registration);
          }
        });
      });
    } catch (err) {
      console.warn('Service worker registration failed:', err);
    }
  });

  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}

function showUpdateBanner(registration) {
  const id = pushToast({
    message: 'An update is ready — tap to refresh.',
    variant: 'brand',
    duration: 8000,
  });
  setTimeout(() => {
    const el = document.querySelector(`[data-toast-id="${id}"]`);
    el?.addEventListener('click', () => {
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
    });
  }, 50);
}

function captureInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    document.dispatchEvent(new CustomEvent('pwa:installable'));
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    pushToast({ message: 'App installed — find it on your home screen.', variant: 'success' });
  });
}

export function canInstall() {
  return !!deferredInstallPrompt;
}

export async function promptInstall() {
  if (!deferredInstallPrompt) return { outcome: 'unavailable' };
  deferredInstallPrompt.prompt();
  const result = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  return result;
}
