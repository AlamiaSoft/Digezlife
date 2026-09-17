import { api } from '../services/api.js';
import { skeletonListHTML, errorStateHTML, emptyStateHTML, offlineStateHTML } from '../components/states.js';
import { icon } from '../components/icon.js';
import { networkStore } from '../state/store.js';

function notifRow(n) {
  return `
    <div class="list-row" style="${n.read ? '' : 'border-color:var(--wa-color-brand-border-normal);'}">
      <div class="list-row__icon">${icon(n.icon)}</div>
      <div class="list-row__body">
        <div class="list-row__title">${n.title}</div>
        <div class="list-row__subtitle">${n.body}</div>
      </div>
      <div class="list-row__meta text-quiet" style="font-weight:400;font-size:0.75rem;">${n.time}</div>
    </div>
  `;
}

export const notificationsScreen = {
  meta: { topbar: { title: 'Notifications' }, nav: 'notifications' },
  render() {
    return `<div class="screen" data-notif-root style="margin-top:0.5rem;">${skeletonListHTML(4)}</div>`;
  },
  async afterRender() {
    const root = document.querySelector('[data-notif-root]');

    async function load() {
      if (!networkStore.get().online) {
        root.innerHTML = offlineStateHTML({ retryId: 'notif-retry' });
        document.getElementById('notif-retry')?.addEventListener('click', load);
        return;
      }
      try {
        const items = await api.getNotifications();
        root.innerHTML = items.length
          ? `<div class="stack">${items.map(notifRow).join('')}</div>`
          : emptyStateHTML({ icon: 'bell-slash', title: 'You\u2019re all caught up', body: 'New notifications will appear here.' });
      } catch {
        root.innerHTML = errorStateHTML({ retryId: 'notif-retry' });
        document.getElementById('notif-retry')?.addEventListener('click', load);
      }
    }
    load();
  },
};
