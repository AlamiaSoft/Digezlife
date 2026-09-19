import { navigate } from '../state/router.js';
import { authStore, pushToast } from '../state/store.js';
import { api } from '../services/api.js';
import { icon } from '../components/icon.js';
import { t } from '../i18n/index.js';
import { swrCache } from '../services/cache.js';
import { formatAmount, formatDate, formatRelativeTime } from '../utils/format.js';

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return t('greetings.morning');
  if (hour < 17) return t('greetings.afternoon');
  return t('greetings.evening');
}

export const homeScreen = {
  meta: { topbar: { showBrand: true }, nav: 'home' },

  render() {
    const { user, household } = authStore.get();
    const householdName = household?.name || 'My Household';
    const userName = user?.name ? user.name.split(' ')[0] : 'there';
    const greeting = `${getTimeGreeting()}, ${userName}`;

    return `
      <div class="screen home-screen">
        <!-- Greeting Header -->
        <section class="home-greeting-row" style="margin-bottom:1rem;">
          <div>
            <a href="#/household" class="home-hero__badge" style="text-decoration:none; cursor:pointer;" aria-label="Manage Household Members">
              <span class="status-dot status-dot--active"></span> ${householdName} &bull; Manage
            </a>
            <h2 class="home-greeting-title" style="margin:0.25rem 0 0 0; font-size:1.35rem; font-weight:800;">${greeting}</h2>
          </div>
        </section>

        <!-- 1. HERO BALANCE & CASHFLOW CARD (Inspired by Design Kit) -->
        <a class="card" id="home-balance-card" href="#/hisab" style="text-decoration:none; color:inherit; display:block; padding:1.25rem; background:var(--wa-color-brand-fill-quiet); border:1px solid color-mix(in srgb, var(--wa-color-brand-fill) 20%, var(--wa-color-surface-border)); border-radius:18px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <span class="text-quiet" style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">
              GHAR KA BALANCE &bull; THIS MONTH
            </span>
            <span class="wa-tag badge-emerald" id="home-balance-badge" style="font-size:0.7rem; font-weight:700;">ON TRACK</span>
          </div>
          <div id="home-balance-amount" style="font-size:1.85rem; font-weight:850; margin:0.35rem 0 0.4rem 0; letter-spacing:-0.02em;">
            PKR 0
          </div>
          <div style="display:flex; gap:1rem; align-items:center; font-size:0.82rem; font-weight:600;">
            <span class="text-green" id="home-income-flow">↑ PKR 0 income</span>
            <span class="text-red" id="home-expense-flow">↓ PKR 0 spent</span>
          </div>
        </a>

        <!-- 2. DUAL TARGET & DUE SOON PROGRESS METERS -->
        <div class="grid2" style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-top:0.75rem;">
          <a class="card" href="#/grocery" style="text-decoration:none; color:inherit; padding:1rem;">
            <span class="text-quiet" style="font-size:0.72rem; font-weight:700; text-transform:uppercase;">Sauda Target</span>
            <div style="font-weight:800; font-size:1.05rem; margin:0.25rem 0 0.4rem 0;" id="home-grocery-ratio">0 items</div>
            <div style="height:6px; background:var(--wa-color-surface-border); border-radius:99px; overflow:hidden;">
              <div id="home-grocery-bar" style="width:40%; height:100%; background:var(--wa-color-brand-fill); border-radius:99px; transition:width 0.3s ease;"></div>
            </div>
          </a>

          <a class="card" href="#/reminders" style="text-decoration:none; color:inherit; padding:1rem;">
            <span class="text-quiet" style="font-size:0.72rem; font-weight:700; text-transform:uppercase;">Due Soon</span>
            <div style="font-weight:800; font-size:1.05rem; margin:0.25rem 0 0.2rem 0;" id="home-due-count">0 Dues</div>
            <div class="text-quiet" style="font-size:0.75rem; color:var(--wa-color-amber-40);" id="home-due-subtitle">No pending bills</div>
          </a>
        </div>

        <!-- 3. 1-TAP QUICK ACTIONS (High Contrast Grid) -->
        <section class="home-section" style="margin-top:1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
            <span class="text-quiet" style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">Quick Actions</span>
          </div>
          <div class="grid3" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.5rem;">
            <a class="home-action-btn card" href="#/hisab?action=record" style="text-decoration:none; padding:0.85rem 0.5rem; text-align:center; display:flex; flex-direction:column; align-items:center; gap:0.35rem;">
              <span class="home-action-btn__icon bg-green" style="width:36px; height:36px; font-size:0.95rem; border-radius:10px; display:grid; place-items:center; background:var(--wa-color-brand-fill); color:#fff;">
                ${icon('plus')}
              </span>
              <span style="font-size:0.78rem; font-weight:700;">Spend</span>
            </a>
            <a class="home-action-btn card" href="#/grocery" style="text-decoration:none; padding:0.85rem 0.5rem; text-align:center; display:flex; flex-direction:column; align-items:center; gap:0.35rem;">
              <span class="home-action-btn__icon bg-blue" style="width:36px; height:36px; font-size:0.95rem; border-radius:10px; display:grid; place-items:center; background:var(--wa-color-brand-fill-quiet); color:var(--wa-color-brand-on-quiet);">
                ${icon('cart-shopping')}
              </span>
              <span style="font-size:0.78rem; font-weight:700;">Sauda</span>
            </a>
            <a class="home-action-btn card" href="#/reminders" style="text-decoration:none; padding:0.85rem 0.5rem; text-align:center; display:flex; flex-direction:column; align-items:center; gap:0.35rem;">
              <span class="home-action-btn__icon bg-amber" style="width:36px; height:36px; font-size:0.95rem; border-radius:10px; display:grid; place-items:center; background:var(--wa-color-amber-90, #fef3c7); color:var(--wa-color-amber-40, #d97706);">
                ${icon('clock')}
              </span>
              <span style="font-size:0.78rem; font-weight:700;">Due Soon</span>
            </a>
          </div>
        </section>

        <!-- 4. RECENT ACTIVITY FEED -->
        <section class="home-section" style="margin-top:1.25rem;">
          <div class="home-section__header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
            <span class="text-quiet" style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">Family Activity</span>
            <a href="#/activity" style="font-size:0.8rem; font-weight:700; color:var(--wa-color-brand-on-normal); text-decoration:none;">View all &rarr;</a>
          </div>
          <div class="card list" id="home-activity-list" style="padding:0.25rem 1rem;">
            <div class="text-quiet" style="text-align:center; padding:1rem 0; font-size:0.85rem;">Loading activity...</div>
          </div>
        </section>

        <!-- 5. SHARED GROCERY QUICK CHECKLIST PREVIEW -->
        <section class="home-section" style="margin-top:1.25rem;">
          <div class="home-section__header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
            <span class="text-quiet" style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">Active Checklist</span>
            <a class="text-brand" href="#/grocery" style="font-size:0.82rem; font-weight:700; text-decoration:none;">${t('home.view_all')} &rarr;</a>
          </div>

          <div class="card" id="home-grocery-preview" style="padding:0.4rem 1rem;">
            <div class="text-quiet" style="text-align:center; padding:1rem 0;">Loading grocery list...</div>
          </div>
        </section>
      </div>
    `;
  },

  async afterRender() {
    const { user, household } = authStore.get();
    const hid = household?.id || 'demo-household';

    // Renders parsed home dashboard state instantly
    const renderHomeDashboard = (payload) => {
      if (!payload) return;
      const { groceryList, hisabSummary, transactions, reminders } = payload;

      // 1. Grocery Progress & Checklist Preview
      const items = groceryList?.items || [];
      const totalGroceries = items.length;
      const pendingGroceries = items.filter((i) => !i.is_checked).length;
      const checkedCount = totalGroceries - pendingGroceries;

      const ratioEl = document.getElementById('home-grocery-ratio');
      if (ratioEl) ratioEl.textContent = `${checkedCount}/${totalGroceries} items`;

      const barEl = document.getElementById('home-grocery-bar');
      if (barEl) {
        barEl.style.width = totalGroceries > 0 ? `${Math.min(Math.round((checkedCount / totalGroceries) * 100), 100)}%` : '0%';
      }

      const previewEl = document.getElementById('home-grocery-preview');
      if (previewEl) {
        if (items.length === 0) {
          previewEl.innerHTML = `
            <div style="text-align:center; padding:1rem 0.5rem;">
              <p class="text-quiet" style="margin:0 0 0.5rem 0; font-size:0.85rem;">No items in grocery list.</p>
              <a href="#/grocery" style="font-size:0.8rem; font-weight:700; color:var(--wa-color-brand-on-normal); text-decoration:none;">+ Add item</a>
            </div>
          `;
        } else {
          previewEl.innerHTML = items.slice(0, 5).map((item) => `
            <div class="grocery-row ${item.is_checked ? 'is-checked' : ''}" style="display:flex; align-items:center; justify-content:space-between; padding:0.6rem 0; border-bottom:1px solid var(--wa-color-surface-border);">
              <label style="display:flex; align-items:center; gap:0.65rem; cursor:pointer; flex:1; min-width:0;">
                <wa-checkbox ${item.is_checked ? 'checked' : ''} data-toggle-home="${item.id}"></wa-checkbox>
                <span class="grocery-item-title ${item.is_checked ? 'text-strike text-quiet' : ''}" style="font-weight:500; font-size:0.92rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${item.name}</span>
              </label>
              <span class="wa-tag" style="font-size:0.72rem; flex-shrink:0;">${item.quantity || 1} ${item.unit || 'pcs'}</span>
            </div>
          `).join('');

          previewEl.querySelectorAll('[data-toggle-home]').forEach((cb) => {
            cb.addEventListener('change', async () => {
              const itemId = cb.dataset.toggleHome;
              const targetItem = items.find((i) => String(i.id) === String(itemId));
              if (targetItem) {
                targetItem.is_checked = !targetItem.is_checked;
                // Optimistic UI update
                const labelTitle = cb.closest('label')?.querySelector('.grocery-item-title');
                if (labelTitle) {
                  labelTitle.classList.toggle('text-strike', targetItem.is_checked);
                  labelTitle.classList.toggle('text-quiet', targetItem.is_checked);
                }
                const updatedChecked = items.filter((i) => i.is_checked).length;
                if (ratioEl) ratioEl.textContent = `${updatedChecked}/${totalGroceries} items`;
                if (barEl) barEl.style.width = `${Math.min(Math.round((updatedChecked / totalGroceries) * 100), 100)}%`;
                
                try {
                  if (groceryList?.id) {
                    await api.toggleGroceryItem(groceryList.id, itemId, hid);
                    swrCache.invalidate('grocery');
                  }
                } catch (e) {}
              }
            });
          });
        }
      }

      // 2. Hisab Summary
      if (hisabSummary) {
        const income = parseFloat(hisabSummary.total_income || 0);
        const expense = parseFloat(hisabSummary.total_expense || 0);
        const netSavings = income - expense;

        const valEl = document.getElementById('home-balance-amount');
        if (valEl) valEl.textContent = `${netSavings < 0 ? '-' : ''}PKR ${formatAmount(Math.abs(netSavings))}`;

        const expenseFlowEl = document.getElementById('home-expense-flow');
        if (expenseFlowEl) expenseFlowEl.textContent = `↓ PKR ${formatAmount(expense)} spent`;

        const badgeEl = document.getElementById('home-balance-badge');
        if (badgeEl) {
          if (income === 0 && expense === 0) {
            badgeEl.textContent = 'NO DATA';
            badgeEl.className = 'wa-tag badge-neutral';
          } else {
            badgeEl.textContent = netSavings >= 0 ? 'SURPLUS' : 'DEFICIT';
            badgeEl.className = `wa-tag ${netSavings >= 0 ? 'badge-emerald' : 'badge-rose'}`;
          }
        }
      }

      // 3. Reminders & Bills
      const remList = Array.isArray(reminders) ? reminders : [];
      const pendingReminders = remList.filter((r) => !r.is_completed);
      const nextReminder = pendingReminders[0]?.title || (remList.length > 0 ? 'All bills settled' : 'No upcoming bills');

      const dueCountEl = document.getElementById('home-due-count');
      if (dueCountEl) dueCountEl.textContent = `${pendingReminders.length} Due`;

      const dueSubEl = document.getElementById('home-due-subtitle');
      if (dueSubEl) dueSubEl.textContent = nextReminder;

      // 4. Unified Activity Feed
      const feed = [];

      items.slice(0, 3).forEach((item) => {
        feed.push({
          initials: user?.name ? user.name.slice(0, 2).toUpperCase() : 'SD',
          avatarBg: 'var(--wa-color-brand-fill-quiet)',
          avatarColor: 'var(--wa-color-brand-on-quiet)',
          text: `${item.is_checked ? 'Checked off' : 'Added'} <strong>${item.name}</strong> ${item.quantity ? `(${item.quantity} ${item.unit || 'pcs'})` : ''}`,
          time: formatRelativeTime(item.updated_at || item.created_at),
          timestamp: new Date(item.updated_at || item.created_at || Date.now()).getTime(),
        });
      });

      (Array.isArray(transactions) ? transactions : []).slice(0, 3).forEach((tx) => {
        const isExpense = tx.type === 'expense';
        feed.push({
          initials: tx.user?.name ? tx.user.name.slice(0, 2).toUpperCase() : (isExpense ? 'EX' : 'IN'),
          avatarBg: isExpense ? 'var(--wa-color-red-90, #fee2e2)' : 'var(--wa-color-blue-90, #dbeafe)',
          avatarColor: isExpense ? 'var(--wa-color-red-40, #dc2626)' : 'var(--wa-color-blue-40, #2563eb)',
          text: isExpense
            ? `Logged expense <strong>PKR ${formatAmount(tx.amount)}</strong> (${tx.category || 'Expense'})`
            : `Logged income <strong>PKR ${formatAmount(tx.amount)}</strong> (${tx.category || 'Income'})`,
          time: formatRelativeTime(tx.transaction_date || tx.created_at),
          timestamp: new Date(tx.transaction_date || tx.created_at || Date.now()).getTime(),
        });
      });

      remList.slice(0, 2).forEach((rem) => {
        const cat = rem.category || 'Reminder';
        feed.push({
          initials: cat.slice(0, 2).toUpperCase(),
          avatarBg: 'var(--wa-color-amber-90, #fef3c7)',
          avatarColor: 'var(--wa-color-amber-40, #d97706)',
          text: `${rem.is_completed ? 'Completed' : 'Upcoming'}: <strong>${rem.title}</strong>`,
          time: formatRelativeTime(rem.created_at || rem.due_at),
          timestamp: new Date(rem.created_at || rem.due_at || Date.now()).getTime(),
        });
      });

      const activityContainer = document.getElementById('home-activity-list');
      if (activityContainer) {
        if (feed.length === 0) {
          activityContainer.innerHTML = `
            <div style="text-align:center; padding:1rem 0; color:var(--wa-color-text-quiet); font-size:0.85rem;">
              No recent activity recorded yet.
            </div>
          `;
        } else {
          feed.sort((a, b) => b.timestamp - a.timestamp);
          activityContainer.innerHTML = feed.slice(0, 3).map((item, idx, arr) => `
            <div class="listitem row" style="display:flex; align-items:center; justify-content:space-between; padding:0.75rem 0; ${idx < arr.length - 1 ? 'border-bottom:1px solid var(--wa-color-surface-border);' : ''}">
              <div style="display:flex; align-items:center; gap:0.6rem; min-width:0; flex:1; padding-right:0.5rem;">
                <div class="avatar sm" style="width:30px; height:30px; font-size:0.75rem; border-radius:50%; background:${item.avatarBg}; color:${item.avatarColor}; display:grid; place-items:center; font-weight:700; flex-shrink:0;">
                  ${item.initials}
                </div>
                <span style="font-size:0.85rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${item.text}</span>
              </div>
              <span class="text-quiet" style="font-size:0.75rem; flex-shrink:0;">${item.time}</span>
            </div>
          `).join('');
        }
      }
    };

    // Parallel fetch with SWR Cache (0ms instant load + background update)
    const fetchHomeData = async () => {
      const [listsRes, sumRes, txRes, remRes] = await Promise.allSettled([
        api.getGroceryLists(hid),
        api.getHisabSummary(null, hid),
        api.getHisabTransactions({ per_page: 5 }, hid),
        api.getReminders(null, hid),
      ]);

      const lists = listsRes.status === 'fulfilled' ? (listsRes.value?.data || []) : [];
      let groceryList = lists[0] || null;
      if (groceryList && groceryList.id && (!groceryList.items || groceryList.items.length === 0)) {
        try {
          const detail = await api.getGroceryList(groceryList.id, hid);
          if (detail?.data) groceryList = detail.data;
        } catch (e) {}
      }

      if (!groceryList || !groceryList.items || groceryList.items.length === 0) {
        try {
          const raw = localStorage.getItem(`digez_grocery_items_${hid}_1`);
          if (raw) {
            const items = JSON.parse(raw);
            if (Array.isArray(items) && items.length > 0) {
              groceryList = { id: 1, name: 'Weekly Essentials', items };
            }
          }
        } catch (e) {}
      }

      let transactions = txRes.status === 'fulfilled' ? (Array.isArray(txRes.value?.data) ? txRes.value.data : (txRes.value?.data?.data || [])) : [];
      if (transactions.length === 0) {
        try {
          const raw = localStorage.getItem(`digez_hisab_txs_${hid}`);
          if (raw) {
            const txs = JSON.parse(raw);
            if (Array.isArray(txs) && txs.length > 0) transactions = txs;
          }
        } catch (e) {}
      }

      let reminders = remRes.status === 'fulfilled' ? (remRes.value?.data || []) : [];
      if (reminders.length === 0) {
        try {
          const raw = localStorage.getItem(`digez_reminders_${hid}`);
          if (raw) {
            const rems = JSON.parse(raw);
            if (Array.isArray(rems) && rems.length > 0) reminders = rems;
          }
        } catch (e) {}
      }

      let hisabSummary = sumRes.status === 'fulfilled' ? sumRes.value?.data : null;
      if (!hisabSummary && transactions.length > 0) {
        const inc = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);
        const exp = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);
        hisabSummary = {
          total_income: inc,
          total_expense: exp,
          net: inc - exp,
        };
      }

      return {
        groceryList,
        hisabSummary,
        transactions,
        reminders,
      };
    };

    try {
      const fresh = await fetchHomeData();
      swrCache.write(`home_dashboard_${hid}`, fresh);
      renderHomeDashboard(fresh);
    } catch (err) {
      console.warn('Home fetch fallback:', err);
    }

    document.addEventListener('app:refresh', async () => {
      try {
        const fresh = await fetchHomeData();
        swrCache.write(`home_dashboard_${hid}`, fresh);
        renderHomeDashboard(fresh);
      } catch (e) {}
    });
  },
};
