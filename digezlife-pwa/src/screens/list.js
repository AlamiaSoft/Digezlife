import { api } from '../services/api.js';
import { skeletonListHTML, errorStateHTML, offlineStateHTML, emptyStateHTML } from '../components/states.js';
import { icon } from '../components/icon.js';
import { networkStore } from '../state/store.js';

function itemRow(item) {
  return `
    <a class="list-row" href="#/item/${item.id}">
      <div class="list-row__icon">${icon(item.icon)}</div>
      <div class="list-row__body">
        <div class="list-row__title">${item.title}</div>
        <div class="list-row__subtitle"><span class="status-dot status-dot--${item.status}"></span>${item.subtitle}</div>
      </div>
      <div class="list-row__meta">${item.amount ? `$${item.amount.toFixed(2)}` : ''}</div>
    </a>
  `;
}

export const listScreen = {
  meta: {
    topbar: {
      title: 'All records',
      actionsHTML: `<button class="app-topbar__icon-btn" data-sort-btn>${icon('arrow-up-wide-short')}</button>`,
    },
    nav: 'home',
  },
  render() {
    return `
      <div class="screen screen--flush">
        <div style="padding:0 var(--app-gutter);">
          <wa-tab-group data-category-tabs style="margin-top:0.75rem;">
            <wa-tab panel="all" active>All</wa-tab>
            <wa-tab panel="Active">Active</wa-tab>
            <wa-tab panel="Pending">Pending</wa-tab>
            <wa-tab panel="Archived">Archived</wa-tab>
            <wa-tab panel="Flagged">Flagged</wa-tab>
          </wa-tab-group>
        </div>
        <div class="stack" data-list-results style="padding:1rem var(--app-gutter);">
          ${skeletonListHTML(6)}
        </div>
      </div>

      <wa-drawer label="Sort by" placement="bottom" data-sort-sheet style="--size:auto;">
        <div class="stack">
          ${['Most recent', 'Highest amount', 'Lowest amount', 'Alphabetical'].map(
            (label, i) => `
            <wa-button appearance="plain" style="justify-content:flex-start;width:100%;" data-sort-option="${i}">
              ${label}
            </wa-button>
          `
          ).join('')}
        </div>
      </wa-drawer>
    `;
  },
  async afterRender() {
    const results = document.querySelector('[data-list-results]');
    const tabs = document.querySelector('[data-category-tabs]');
    const sortSheet = document.querySelector('[data-sort-sheet]');
    let currentCategory = 'All';

    async function load() {
      if (!networkStore.get().online) {
        results.innerHTML = offlineStateHTML({ retryId: 'list-retry' });
        document.getElementById('list-retry')?.addEventListener('click', load);
        return;
      }
      results.innerHTML = skeletonListHTML(6);
      try {
        const category = currentCategory === 'all' ? 'All' : currentCategory;
        const items = await api.getItems({ category });
        results.innerHTML = items.length
          ? items.map(itemRow).join('')
          : emptyStateHTML({
              icon: 'filter-circle-xmark',
              title: 'No matches',
              body: 'Try a different category or clear your filters.',
            });
      } catch {
        results.innerHTML = errorStateHTML({ retryId: 'list-retry' });
        document.getElementById('list-retry')?.addEventListener('click', load);
      }
    }

    tabs?.addEventListener('wa-tab-show', (e) => {
      currentCategory = e.detail.name;
      load();
    });

    document.querySelector('[data-sort-btn]')?.addEventListener('click', () => {
      if (sortSheet) sortSheet.open = true;
    });

    sortSheet?.querySelectorAll('[data-sort-option]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (sortSheet) sortSheet.open = false;
      });
    });

    load();
  },
};
