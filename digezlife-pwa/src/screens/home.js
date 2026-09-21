import { navigate } from '../state/router.js';
import { authStore, pushToast } from '../state/store.js';
import { api } from '../services/api.js';
import { icon } from '../components/icon.js';
import { t } from '../i18n/index.js';
import { swrCache } from '../services/cache.js';
import { formatAmount, formatDate, formatRelativeTime } from '../utils/format.js';
import { householdStore } from '../state/household-store.js';
import { householdSync } from '../services/household-sync.js';

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
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.4rem; padding-top:0.4rem; border-top:1px dashed color-mix(in srgb, var(--wa-color-brand-fill) 25%, transparent);">
            <div style="display:flex; gap:1rem; align-items:center; font-size:0.82rem; font-weight:600;">
              <span class="text-green" id="home-income-flow">↑ PKR 0 income</span>
              <span class="text-red" id="home-expense-flow">↓ PKR 0 spent</span>
            </div>
            <span style="font-size:0.75rem; font-weight:700; color:var(--wa-color-brand-on-normal, #ea580c); display:inline-flex; align-items:center; gap:3px;">
              Reports &rarr;
            </span>
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

    // Renders home dashboard strictly from the centralized householdStore
    const renderHomeDashboard = (state) => {
      if (!state) return;
      const { grocery, summary, transactions, reminders, activity } = state;

      // 1. Grocery Progress & Checklist Preview
      const items = grocery?.items || [];
      const totalGroceries = grocery?.total_count || items.length;
      const checkedCount = grocery?.checked_count !== undefined ? grocery.checked_count : items.filter((i) => i.is_checked).length;

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
              const listId = grocery?.primary_list_id || 1;

              await householdSync.mutate({
                entity: 'grocery',
                operation: 'toggle',
                optimisticUpdate: (prev) => {
                  const newItems = (prev.grocery?.items || []).map((it) => {
                    if (String(it.id) === String(itemId)) {
                      return { ...it, is_checked: !it.is_checked };
                    }
                    return it;
                  });
                  const chk = newItems.filter((i) => i.is_checked).length;
                  return {
                    grocery: {
                      ...prev.grocery,
                      items: newItems,
                      checked_count: chk,
                      pending_count: newItems.length - chk,
                    },
                  };
                },
                apiCall: () => api.toggleGroceryItem(listId, itemId, hid),
              });
            });
          });
        }
      }

      // 2. Authoritative Financial Summary
      if (summary) {
        const income = parseFloat(summary.income || 0);
        const expense = parseFloat(summary.expenses || 0);
        const netSavings = parseFloat(summary.balance || 0);

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
            badgeEl.textContent = summary.status === 'deficit' || netSavings < 0 ? 'DEFICIT' : 'SURPLUS';
            badgeEl.className = `wa-tag ${summary.status === 'deficit' || netSavings < 0 ? 'badge-rose' : 'badge-emerald'}`;
          }
        }
      }

      // 3. Reminders & Bills
      const remActive = reminders?.active || [];
      const pendingRemindersCount = reminders?.pending_count !== undefined ? reminders.pending_count : remActive.length;
      const nextReminder = reminders?.next_due || (remActive.length > 0 ? remActive[0]?.title : 'No upcoming bills');

      const dueCountEl = document.getElementById('home-due-count');
      if (dueCountEl) dueCountEl.textContent = `${pendingRemindersCount} Due`;

      const dueSubEl = document.getElementById('home-due-subtitle');
      if (dueSubEl) dueSubEl.textContent = nextReminder;

      // 4. Unified Activity Feed
      const feed = Array.isArray(activity) ? activity : [];
      const activityContainer = document.getElementById('home-activity-list');
      if (activityContainer) {
        if (feed.length === 0) {
          activityContainer.innerHTML = `
            <div style="text-align:center; padding:1rem 0; color:var(--wa-color-text-quiet); font-size:0.85rem;">
              No recent activity recorded yet.
            </div>
          `;
        } else {
          activityContainer.innerHTML = feed.slice(0, 3).map((item, idx, arr) => {
            const isExpense = item.type === 'expense';
            const isIncome = item.type === 'income';
            const bg = isExpense ? 'var(--wa-color-red-90, #fee2e2)' : (isIncome ? 'var(--wa-color-green-90, #dcfce7)' : 'var(--wa-color-brand-fill-quiet)');
            const color = isExpense ? 'var(--wa-color-red-40, #dc2626)' : (isIncome ? 'var(--wa-color-green-40, #16a34a)' : 'var(--wa-color-brand-on-quiet)');
            const initials = item.actor_name ? item.actor_name.slice(0, 2).toUpperCase() : 'HM';

            return `
              <div class="listitem row" style="display:flex; align-items:center; justify-content:space-between; padding:0.75rem 0; ${idx < arr.length - 1 ? 'border-bottom:1px solid var(--wa-color-surface-border);' : ''}">
                <div style="display:flex; align-items:center; gap:0.6rem; min-width:0; flex:1; padding-right:0.5rem;">
                  <div class="avatar sm" style="width:30px; height:30px; font-size:0.75rem; border-radius:50%; background:${bg}; color:${color}; display:grid; place-items:center; font-weight:700; flex-shrink:0;">
                    ${initials}
                  </div>
                  <span style="font-size:0.85rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                    ${item.entity_type === 'transaction'
                      ? `${item.type === 'expense' ? 'Spent' : 'Received'} <strong>PKR ${formatAmount(item.amount)}</strong> (${item.title || item.category})`
                      : (item.entity_type === 'grocery' ? `${item.type === 'checked' ? 'Bought' : 'Added'} <strong>${item.title}</strong>` : `Reminder: <strong>${item.title}</strong>`)}
                  </span>
                </div>
                <span class="text-quiet" style="font-size:0.75rem; flex-shrink:0;">${item.time_text || ''}</span>
              </div>
            `;
          }).join('');
        }
      }
    };

    // Render immediately from current centralized store (0ms instant render)
    renderHomeDashboard(householdStore.get());

    // Subscribe to store updates: any mutation anywhere updates Home immediately
    const unsubscribe = householdStore.subscribe((updatedState) => {
      renderHomeDashboard(updatedState);
    });

    // Background sync
    householdSync.sync({ force: false });
  },
};
