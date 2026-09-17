import { api } from '../services/api.js';
import { skeletonListHTML, errorStateHTML } from '../components/states.js';
import { icon } from '../components/icon.js';
import { pushToast } from '../state/store.js';

export const detailScreen = {
  meta: {
    topbar: {
      title: 'Details',
      back: true,
      actionsHTML: `<button class="app-topbar__icon-btn" data-share-btn>${icon('share-nodes')}</button>`,
    },
    nav: null,
  },
  render() {
    return `<div class="screen" data-detail-root>${skeletonListHTML(3)}</div>`;
  },
  async afterRender(params) {
    const root = document.querySelector('[data-detail-root]');
    document.querySelector('[data-share-btn]')?.addEventListener('click', () => (location.hash = '/share'));

    try {
      const item = await api.getItem(params.id);
      root.innerHTML = `
        <div class="screen-section row" style="align-items:flex-start;">
          <div class="list-row__icon" style="width:3.25rem;height:3.25rem;font-size:1.3rem;">${icon(item.icon)}</div>
          <div style="flex:1;">
            <h2 style="font-size:1.15rem;">${item.title}</h2>
            <p class="text-quiet" style="font-size:0.85rem;">${item.reference}</p>
          </div>
          <wa-tag variant="${item.status === 'flagged' ? 'danger' : item.status === 'pending' ? 'warning' : 'success'}" appearance="tinted">${item.status}</wa-tag>
        </div>

        ${item.amount ? `
        <div class="screen-section card" style="text-align:center;">
          <span class="eyebrow">Amount</span>
          <div style="font-size:1.9rem;font-weight:800;font-family:var(--wa-font-family-heading);">$${item.amount.toFixed(2)}</div>
        </div>` : ''}

        <div class="screen-section">
          <h3 style="font-size:0.95rem;margin-bottom:0.75rem;">Timeline</h3>
          <div class="stack">
            ${item.timeline.map(
              (t) => `
              <div class="row" style="gap:0.6rem;">
                ${icon(t.done ? 'circle-check' : 'circle', { className: t.done ? '' : 'text-quiet' })}
                <div style="flex:1;">
                  <div style="font-size:0.875rem;font-weight:600;">${t.label}</div>
                </div>
                <span class="text-quiet" style="font-size:0.8rem;">${t.date}</span>
              </div>
            `
            ).join('')}
          </div>
        </div>

        <div class="screen-section">
          <h3 style="font-size:0.95rem;margin-bottom:0.5rem;">Notes</h3>
          <p class="text-quiet" style="font-size:0.875rem;">${item.notes}</p>
        </div>

        <div class="screen-section row" style="gap:0.75rem;">
          <wa-button appearance="outlined" style="flex:1;" href="#/item/${item.id}/edit">
            ${icon('pen')} Edit
          </wa-button>
          <wa-button variant="danger" appearance="outlined" style="flex:1;" data-archive>
            ${icon('box-archive')} Archive
          </wa-button>
        </div>
      `;

      document.querySelector('[data-archive]')?.addEventListener('click', () => {
        pushToast({ message: 'Record archived.', variant: 'neutral' });
        history.back();
      });
    } catch {
      root.innerHTML = errorStateHTML({ title: 'Couldn\u2019t load this record' });
    }
  },
};
