import { icon } from './icon.js';

export function skeletonListHTML(count = 5) {
  return `
    <div class="stack" aria-busy="true" aria-label="Loading">
      ${Array.from({ length: count })
        .map(
          () => `
        <div class="skeleton-row">
          <wa-skeleton effect="sheen" style="width:2.75rem;height:2.75rem;border-radius:var(--wa-border-radius-l);flex:0 0 auto;"></wa-skeleton>
          <div class="stack" style="flex:1;gap:0.4rem;">
            <wa-skeleton effect="sheen" style="width:70%;height:0.9rem;"></wa-skeleton>
            <wa-skeleton effect="sheen" style="width:45%;height:0.75rem;"></wa-skeleton>
          </div>
        </div>
      `
        )
        .join('')}
    </div>
  `;
}

export function emptyStateHTML({
  icon: iconName = 'inbox',
  title = 'Nothing here yet',
  body = 'When you add something, it will show up here.',
  actionLabel = '',
  actionHref = '',
} = {}) {
  return `
    <div class="state-panel">
      <div class="state-panel__icon state-panel__icon--brand">${icon(iconName)}</div>
      <h3>${title}</h3>
      <p>${body}</p>
      ${
        actionLabel
          ? `<wa-button variant="brand" href="${actionHref}">${actionLabel}</wa-button>`
          : ''
      }
    </div>
  `;
}

export function errorStateHTML({
  title = 'Something went wrong',
  body = 'We couldn\u2019t load this. Check your connection and try again.',
  retryId = 'retry-action',
} = {}) {
  return `
    <div class="state-panel">
      <div class="state-panel__icon state-panel__icon--danger">${icon('triangle-exclamation')}</div>
      <h3>${title}</h3>
      <p>${body}</p>
      <wa-button variant="neutral" appearance="outlined" id="${retryId}">${icon('rotate-right')} Try again</wa-button>
    </div>
  `;
}

export function offlineStateHTML({ retryId = 'retry-action' } = {}) {
  return `
    <div class="state-panel">
      <div class="state-panel__icon">${icon('wifi')}</div>
      <h3>You're offline</h3>
      <p>Showing the last saved data. Reconnect to get the latest updates.</p>
      <wa-button variant="neutral" appearance="outlined" id="${retryId}">${icon('rotate-right')} Retry</wa-button>
    </div>
  `;
}

export function notFoundStateHTML() {
  return `
    <div class="state-panel">
      <div class="state-panel__icon">${icon('compass')}</div>
      <h3>Page unavailable</h3>
      <p>The screen you're looking for doesn't exist or may have moved.</p>
      <wa-button variant="brand" href="#/home">Back to home</wa-button>
    </div>
  `;
}
