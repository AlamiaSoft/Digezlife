import { icon } from '../components/icon.js';
import { authStore } from '../state/store.js';
import { api } from '../services/api.js';

export const searchScreen = {
  meta: { topbar: { title: 'Search Household', back: true }, nav: 'home' },


  render() {
    return `
      <div class="screen search-screen">
        <div class="search-bar-wrap" style="margin-bottom:1rem;">
          <wa-input id="household-search-input" placeholder="Search groceries, transactions, alerts..." style="width:100%;">
            <wa-icon slot="start" name="magnifying-glass"></wa-icon>
          </wa-input>
        </div>

        <div id="search-results" class="stack" style="gap:0.75rem;">
          <div class="card text-quiet" style="text-align:center; padding:2rem 1rem;">
            ${icon('magnifying-glass')}
            <p style="margin:0.5rem 0 0 0;">Type above to search across your household.</p>
          </div>
        </div>
      </div>
    `;
  },

  async afterRender() {
    const { household } = authStore.get();
    const hid = household?.id || 'demo-household';

    const input = document.getElementById('household-search-input');
    const resultsContainer = document.getElementById('search-results');

    input?.addEventListener('input', async (e) => {
      const q = e.target.value?.trim().toLowerCase();
      if (!q || q.length < 2) {
        if (resultsContainer) {
          resultsContainer.innerHTML = `
            <div class="card text-quiet" style="text-align:center; padding:2rem 1rem;">
              ${icon('magnifying-glass')}
              <p style="margin:0.5rem 0 0 0;">Type above to search across your household.</p>
            </div>
          `;
        }
        return;
      }

      try {
        const [listsRes, txRes, remRes] = await Promise.all([
          api.getGroceryLists(hid).catch(() => null),
          api.getHisabTransactions(null, hid).catch(() => null),
          api.getReminders(null, hid).catch(() => null),
        ]);

        const items = [];
        if (listsRes?.data) {
          const rawLists = Array.isArray(listsRes.data) ? listsRes.data : [];
          rawLists.forEach((l) => {
            const listItems = l.items || [];
            listItems.forEach((i) => {
              if (i.name?.toLowerCase().includes(q) || (i.category && i.category.toLowerCase().includes(q))) {
                items.push({ type: 'Grocery', title: i.name, sub: `${i.quantity || 1} ${i.unit || 'pcs'} &bull; ${l.name || 'Grocery'}`, link: '#/grocery' });
              }
            });
          });
        }

        if (txRes?.data) {
          const rawTxs = Array.isArray(txRes.data) ? txRes.data : (txRes.data?.data || []);
          rawTxs.forEach((t) => {
            const label = t.notes || t.category || 'Transaction';
            if (label.toLowerCase().includes(q) || (t.category && t.category.toLowerCase().includes(q))) {
              items.push({ type: 'Hisab', title: label, sub: `PKR ${parseFloat(t.amount || 0).toLocaleString()} &bull; ${t.type || 'expense'}`, link: '#/hisab?tab=transactions' });
            }
          });
        }

        if (remRes?.data) {
          const rawReminders = Array.isArray(remRes.data) ? remRes.data : (remRes.data?.data || []);
          rawReminders.forEach((r) => {
            if (r.title?.toLowerCase().includes(q) || (r.category && r.category.toLowerCase().includes(q))) {
              items.push({ type: 'Reminder', title: r.title, sub: `Due: ${r.due_at ? new Date(r.due_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Upcoming'}`, link: '#/reminders' });
            }
          });
        }

        if (resultsContainer) {
          if (items.length === 0) {
            resultsContainer.innerHTML = `
              <div class="card text-quiet" style="text-align:center; padding:2rem 1rem;">
                No matches found for "${q}".
              </div>
            `;
          } else {
            resultsContainer.innerHTML = items.map((res) => `
              <a class="card list-row" href="${res.link}">
                <div class="list-row__icon" style="background:var(--wa-color-brand-fill-quiet); color:var(--wa-color-brand-on-quiet);">
                  ${icon(res.type === 'Grocery' ? 'cart-shopping' : res.type === 'Hisab' ? 'wallet' : 'bell')}
                </div>
                <div class="list-row__body">
                  <span class="wa-tag" style="font-size:0.7rem;">${res.type}</span>
                  <div class="list-row__title" style="margin-top:0.2rem;">${res.title}</div>
                  <div class="list-row__subtitle">${res.sub}</div>
                </div>
              </a>
            `).join('');
          }
        }
      } catch (err) {
        // search error
      }
    });
  },
};
