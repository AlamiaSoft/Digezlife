import { navigate } from '../state/router.js';
import { authStore, pushToast } from '../state/store.js';
import { api } from '../services/api.js';
import { icon } from '../components/icon.js';
import { t } from '../i18n/index.js';

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return t('greetings.morning');
  if (hour < 17) return t('greetings.afternoon');
  return t('greetings.evening');
}

function formatAmount(num) {
  const val = Math.abs(parseFloat(num) || 0);
  if (val >= 1000000) {
    return (val / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (val >= 100000) {
    return (val / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return val.toLocaleString();
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
        <section class="home-greeting-row" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <div>
            <a href="#/household" class="home-hero__badge" style="text-decoration:none; cursor:pointer;" aria-label="Manage Household Members">
              <span class="status-dot status-dot--active"></span> ${householdName} &bull; Manage
            </a>
            <h2 class="home-greeting-title" style="margin:0.25rem 0 0 0; font-size:1.35rem; font-weight:800;">${greeting}</h2>
          </div>
          <a href="#/household" class="avatar sm" style="width:38px; height:38px; font-size:0.85rem; text-decoration:none; background:var(--wa-color-brand-fill-quiet); color:var(--wa-color-brand-on-quiet); font-weight:800;">
            ${user?.name ? user.name.slice(0, 2).toUpperCase() : 'ME'}
          </a>
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
              <span class="home-action-btn__icon bg-amber" style="width:36px; height:36px; font-size:0.95rem; border-radius:10px; display:grid; place-items:center; background:var(--wa-color-amber-90); color:var(--wa-color-amber-40);">
                ${icon('clock')}
              </span>
              <span style="font-size:0.78rem; font-weight:700;">Due Soon</span>
            </a>
          </div>
        </section>

        <!-- 4. FAMILY ACTIVITY STREAM SNIPPET -->
        <section class="home-section" style="margin-top:1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
            <span class="text-quiet" style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">Family Activity</span>
            <a href="#/activity" style="font-size:0.8rem; font-weight:700; color:var(--wa-color-brand-on-normal); text-decoration:none;">View all &rarr;</a>
          </div>
          <div class="card list" id="home-activity-list" style="padding:0.25rem 1rem;">
            <div class="text-quiet" style="text-align:center; padding:1rem 0; font-size:0.85rem;">Loading activity...</div>
          </div>
        </section>

        <!-- 5. SHARED GROCERY QUICK CHECKLIST -->
        <section class="home-section" style="margin-top:1.25rem;">
          <div class="home-section__header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
            <div>
              <span class="text-quiet" style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">Active Checklist</span>
            </div>
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

    let pendingGroceries = 0;
    let totalGroceries = 0;
    let pendingReminders = 0;
    let nextReminderTitle = '';
    let netSavings = 0;

    const activityFeed = [];

    function timeAgo(dateInput) {
      if (!dateInput) return 'Recently';
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return 'Recently';
      const diffSec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      if (diffMin < 1) return 'Just now';
      if (diffMin < 60) return `${diffMin}m`;
      if (diffHour < 24) return `${diffHour}h`;
      if (diffDay === 1) return '1d';
      if (diffDay < 7) return `${diffDay}d`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }

    // 1. Fetch grocery
    try {
      const listsRes = await api.getGroceryLists(hid);
      const lists = listsRes?.data || [];
      if (lists.length > 0) {
        const firstList = lists[0];
        const detailRes = await api.getGroceryList(firstList.id, hid).catch(() => null);
        const items = detailRes?.data?.items || firstList.items || [];
        totalGroceries = items.length;
        const pending = items.filter((i) => !i.is_checked);
        pendingGroceries = pending.length;
        const checkedCount = totalGroceries - pendingGroceries;

        const ratioEl = document.getElementById('home-grocery-ratio');
        if (ratioEl) ratioEl.textContent = `${checkedCount}/${totalGroceries} items`;

        const barEl = document.getElementById('home-grocery-bar');
        if (barEl && totalGroceries > 0) {
          barEl.style.width = `${Math.min(Math.round((checkedCount / totalGroceries) * 100), 100)}%`;
        }

        // Add latest items to activity feed
        items.slice(0, 3).forEach((item) => {
          activityFeed.push({
            initials: user?.name ? user.name.slice(0, 2).toUpperCase() : 'SD',
            avatarBg: 'var(--wa-color-brand-fill-quiet)',
            avatarColor: 'var(--wa-color-brand-on-quiet)',
            text: `${item.is_checked ? 'Checked off' : 'Added'} <strong>${item.name}</strong> ${item.quantity ? `(${item.quantity} ${item.unit || 'pcs'})` : ''}`,
            time: timeAgo(item.updated_at || item.created_at),
            timestamp: new Date(item.updated_at || item.created_at || Date.now()).getTime(),
          });
        });

        const previewEl = document.getElementById('home-grocery-preview');
        if (previewEl) {
          if (items.length === 0) {
            previewEl.innerHTML = `<p class="text-quiet" style="text-align:center; margin:0.5rem 0;">No items in list. <a href="#/grocery">Add item</a></p>`;
          } else {
            previewEl.innerHTML = items.slice(0, 5).map((item) => `
              <div class="grocery-row ${item.is_checked ? 'is-checked' : ''}" style="display:flex; align-items:center; justify-content:space-between; padding:0.6rem 0; border-bottom:1px solid var(--wa-color-surface-border);">
                <label style="display:flex; align-items:center; gap:0.65rem; cursor:pointer; flex:1; min-width:0;">
                  <wa-checkbox ${item.is_checked ? 'checked' : ''} data-toggle-home="${item.id}"></wa-checkbox>
                  <span class="grocery-item-title ${item.is_checked ? 'text-strike text-quiet' : ''}" style="font-weight:500; font-size:0.92rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${item.name}</span>
                </label>
                <span class="wa-tag" style="font-size:0.75rem; flex-shrink:0;">${item.quantity || 1} ${item.unit || 'pcs'}</span>
              </div>
            `).join('');

            previewEl.querySelectorAll('[data-toggle-home]').forEach((cb) => {
              cb.addEventListener('change', async () => {
                const itemId = cb.dataset.toggleHome;
                try {
                  await api.toggleGroceryItem(firstList.id, itemId, hid);
                  pushToast({ message: 'Item updated', variant: 'success' });
                } catch (e) {}
              });
            });
          }
        }
      }
    } catch (e) {}

    // 2. Fetch Hisab
    try {
      const summaryRes = await api.getHisabSummary(null, hid);
      if (summaryRes?.data) {
        const income = parseFloat(summaryRes.data.total_income || 0);
        const expense = parseFloat(summaryRes.data.total_expense || 0);
        netSavings = income - expense;

        const valEl = document.getElementById('home-balance-amount');
        if (valEl) valEl.textContent = `${netSavings < 0 ? '-' : ''}PKR ${formatAmount(Math.abs(netSavings))}`;

        const incomeFlowEl = document.getElementById('home-income-flow');
        if (incomeFlowEl) incomeFlowEl.textContent = `↑ PKR ${formatAmount(income)} income`;

        const expenseFlowEl = document.getElementById('home-expense-flow');
        if (expenseFlowEl) expenseFlowEl.textContent = `↓ PKR ${formatAmount(expense)} spent`;

        const badgeEl = document.getElementById('home-balance-badge');
        if (badgeEl) {
          badgeEl.textContent = netSavings >= 0 ? 'SURPLUS' : 'DEFICIT';
          badgeEl.className = `wa-tag ${netSavings >= 0 ? 'badge-emerald' : 'badge-rose'}`;
        }
      }

      const txRes = await api.getHisabTransactions({ per_page: 5 }, hid);
      const txs = Array.isArray(txRes?.data) ? txRes.data : (txRes?.data?.data || []);
      txs.forEach((tx) => {
        const isExpense = tx.type === 'expense';
        activityFeed.push({
          initials: tx.user?.name ? tx.user.name.slice(0, 2).toUpperCase() : (isExpense ? 'EX' : 'IN'),
          avatarBg: isExpense ? 'var(--wa-color-red-90, #fee2e2)' : 'var(--wa-color-blue-90, #dbeafe)',
          avatarColor: isExpense ? 'var(--wa-color-red-40, #dc2626)' : 'var(--wa-color-blue-40, #2563eb)',
          text: isExpense
            ? `Logged expense <strong>PKR ${formatAmount(tx.amount)}</strong> (${tx.category || 'Expense'})`
            : `Logged income <strong>PKR ${formatAmount(tx.amount)}</strong> (${tx.category || 'Income'})`,
          time: timeAgo(tx.transaction_date || tx.created_at),
          timestamp: new Date(tx.transaction_date || tx.created_at || Date.now()).getTime(),
        });
      });
    } catch (e) {}

    // 3. Fetch Reminders
    try {
      const remindersRes = await api.getReminders(null, hid);
      const reminders = remindersRes?.data || [];
      const pending = reminders.filter((r) => !r.is_completed);
      pendingReminders = pending.length;
      if (pending.length > 0) {
        nextReminderTitle = pending[0].title;
      }

      const dueCountEl = document.getElementById('home-due-count');
      if (dueCountEl) dueCountEl.textContent = `${pendingReminders} Due${pendingReminders === 1 ? '' : 's'}`;

      const dueSubEl = document.getElementById('home-due-subtitle');
      if (dueSubEl) {
        dueSubEl.textContent = nextReminderTitle ? `Next: ${nextReminderTitle}` : 'All bills settled';
      }

      reminders.slice(0, 2).forEach((rem) => {
        const cat = rem.category || 'Reminder';
        const isBill = cat.toLowerCase() === 'bill';
        activityFeed.push({
          initials: cat.slice(0, 2).toUpperCase(),
          avatarBg: 'var(--wa-color-amber-90, #fef3c7)',
          avatarColor: 'var(--wa-color-amber-40, #d97706)',
          text: `${rem.is_completed ? 'Completed' : (isBill ? 'Due bill' : 'Upcoming')}: <strong>${rem.title}</strong>`,
          time: timeAgo(rem.created_at || rem.due_at),
          timestamp: new Date(rem.created_at || rem.due_at || Date.now()).getTime(),
        });
      });
    } catch (e) {}

    // Render Activity Feed
    const activityContainer = document.getElementById('home-activity-list');
    if (activityContainer) {
      if (activityFeed.length === 0) {
        activityContainer.innerHTML = `
          <div style="text-align:center; padding:1rem 0; color:var(--wa-color-text-quiet); font-size:0.85rem;">
            No recent activity recorded yet.
          </div>
        `;
      } else {
        activityFeed.sort((a, b) => b.timestamp - a.timestamp);
        activityContainer.innerHTML = activityFeed.slice(0, 3).map((item, idx, arr) => `
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

    document.addEventListener('app:refresh', () => {
      homeScreen.afterRender();
    });
  },
};
