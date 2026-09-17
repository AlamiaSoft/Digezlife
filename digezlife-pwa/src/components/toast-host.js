import { toastStore, dismissToast } from '../state/store.js';

/**
 * Renders a fixed toast host and keeps it in sync with toastStore.
 * Call mountToastHost() once, after the app shell is in the DOM.
 */
export function toastHostHTML() {
  return `<div class="app-toast-host" data-toast-host aria-live="polite"></div>`;
}

export function mountToastHost() {
  const host = document.querySelector('[data-toast-host]');
  if (!host) return;

  toastStore.subscribe((state) => {
    host.innerHTML = state.queue
      .map(
        (t) => `
        <wa-callout variant="${t.variant}" data-toast-id="${t.id}" style="pointer-events:auto;max-width:22rem;width:100%;box-shadow:var(--app-shadow-2);">
          ${t.message}
        </wa-callout>
      `
      )
      .join('');

    state.queue.forEach((t) => {
      setTimeout(() => dismissToast(t.id), t.duration);
    });
  });
}
