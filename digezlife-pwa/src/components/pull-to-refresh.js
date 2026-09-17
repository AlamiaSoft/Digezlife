import { icon } from './icon.js';

let isRefreshing = false;

export function pullToRefreshHTML() {
  return `
    <div class="ptr-host" id="ptr-host" aria-hidden="true">
      <div class="ptr-pill">
        <span id="ptr-arrow-wrap" class="ptr-icon-wrap">${icon('arrow-down')}</span>
        <wa-spinner id="ptr-spinner-icon" class="ptr-spinner" style="display:none;"></wa-spinner>
        <span id="ptr-status-label" class="ptr-label">Pull to refresh</span>
      </div>
    </div>
  `;
}

export function mountPullToRefresh() {
  const content = document.querySelector('.app-shell__content');
  const ptrHost = document.getElementById('ptr-host');
  const arrowWrap = document.getElementById('ptr-arrow-wrap');
  const spinnerIcon = document.getElementById('ptr-spinner-icon');
  const label = document.getElementById('ptr-status-label');

  if (!content || !ptrHost) return;

  let startY = 0;
  let currentY = 0;
  let isDragging = false;
  const PULL_THRESHOLD = 52;
  const MAX_PULL = 78;

  content.addEventListener(
    'touchstart',
    (e) => {
      if (content.scrollTop <= 0 && !isRefreshing) {
        startY = e.touches[0].pageY;
        isDragging = true;
      } else {
        isDragging = false;
      }
    },
    { passive: true }
  );

  content.addEventListener(
    'touchmove',
    (e) => {
      if (!isDragging || isRefreshing) return;

      currentY = e.touches[0].pageY;
      const diff = currentY - startY;

      if (diff > 0 && content.scrollTop <= 0) {
        // Apply rubber-band resistance curve
        const pullDistance = Math.min(diff * 0.42, MAX_PULL);

        ptrHost.style.height = `${pullDistance}px`;
        ptrHost.style.opacity = `${Math.min(pullDistance / 30, 1)}`;

        if (pullDistance >= PULL_THRESHOLD) {
          if (arrowWrap) arrowWrap.style.transform = 'rotate(180deg)';
          if (label) label.textContent = 'Release to refresh';
        } else {
          if (arrowWrap) arrowWrap.style.transform = 'rotate(0deg)';
          if (label) label.textContent = 'Pull to refresh';
        }
      }
    },
    { passive: true }
  );

  content.addEventListener(
    'touchend',
    async () => {
      if (!isDragging || isRefreshing) {
        isDragging = false;
        return;
      }

      isDragging = false;
      const diff = currentY - startY;
      const pullDistance = Math.min(diff * 0.42, MAX_PULL);

      if (pullDistance >= PULL_THRESHOLD && content.scrollTop <= 0) {
        isRefreshing = true;
        ptrHost.style.height = '48px';
        ptrHost.style.opacity = '1';

        if (arrowWrap) arrowWrap.style.display = 'none';
        if (spinnerIcon) spinnerIcon.style.display = 'inline-block';
        if (label) label.textContent = 'Updating...';

        // Trigger light haptic feedback if supported
        if ('vibrate' in navigator) {
          try {
            navigator.vibrate(15);
          } catch {}
        }

        // Dispatch app-wide refresh event
        document.dispatchEvent(new CustomEvent('app:refresh'));

        // Check for service worker updates in background
        if ('serviceWorker' in navigator) {
          try {
            const reg = await navigator.serviceWorker.getRegistration();
            await reg?.update();
          } catch {}
        }

        setTimeout(() => {
          if (label) label.textContent = 'Refreshed';
          setTimeout(() => {
            ptrHost.style.height = '0px';
            ptrHost.style.opacity = '0';
            setTimeout(() => {
              if (arrowWrap) {
                arrowWrap.style.display = 'inline-flex';
                arrowWrap.style.transform = 'rotate(0deg)';
              }
              if (spinnerIcon) spinnerIcon.style.display = 'none';
              if (label) label.textContent = 'Pull to refresh';
              isRefreshing = false;
            }, 250);
          }, 400);
        }, 600);
      } else {
        ptrHost.style.height = '0px';
        ptrHost.style.opacity = '0';
        if (arrowWrap) arrowWrap.style.transform = 'rotate(0deg)';
      }
    },
    { passive: true }
  );
}
