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
        <section class="home-greeting-row">
          <div>
            <a href="#/household" class="home-hero__badge" style="text-decoration:none; cursor:pointer;" aria-label="Manage Household Members">
              <span class="status-dot status-dot--active"></span> ${householdName} &bull; Manage
            </a>
            <h2 class="home-greeting-title">${greeting}</h2>
          </div>
        </section>

        <!-- ATTENTION AREA: What needs attention right now? -->
        <div class="card home-attention-card" id="home-attention-box">
          <div class="home-attention-card__inner">
            <div class="list-row__icon" id="attention-icon" style="background:var(--wa-color-brand-fill-quiet); color:var(--wa-color-brand-on-quiet);">
              ${icon('sparkles')}
            </div>
            <div style="flex:1; min-width:0;">
              <div class="home-attention-card__headline" id="attention-headline">${t('greetings.whats_happening')}</div>
              <div class="home-attention-card__sub text-quiet" id="attention-sub">Checking your household tasks...</div>
            </div>
          </div>
        </div>

        <!-- 1-TAP QUICK ACTIONS -->
        <section class="home-section" style="margin-top:1.25rem;">
          <div class="home-quick-actions-bar">
            <a class="home-action-btn" href="#/hisab">
              <span class="home-action-btn__icon bg-green">${icon('plus')}</span>
              <span>${t('home.add_expense')}</span>
            </a>
            <a class="home-action-btn" href="#/grocery">
              <span class="home-action-btn__icon bg-blue">${icon('cart-shopping')}</span>
              <span>${t('home.add_grocery')}</span>
            </a>
            <a class="home-action-btn" href="#/reminders">
              <span class="home-action-btn__icon bg-purple">${icon('bell')}</span>
              <span>${t('home.add_alert')}</span>
            </a>
            <a class="home-action-btn" href="#/household">
              <span class="home-action-btn__icon bg-amber">${icon('user-plus')}</span>
              <span>${t('home.invite_family')}</span>
            </a>
          </div>
        </section>

        <!-- UTILITY STATS OVERVIEW -->
        <div class="home-stats-grid" id="home-stats" style="margin-top:1.25rem;">
          <a class="home-stat-card card" href="#/grocery">
            <div class="home-stat-card__head">
              <span class="home-stat-card__label">${t('nav.grocery').toUpperCase()}</span>
              <span class="home-stat-card__badge badge-blue" id="home-stat-grocery-badge">Loading...</span>
            </div>
            <div class="home-stat-card__value" id="home-stat-grocery-title">Weekly Essentials</div>
            <div class="home-stat-card__meta text-quiet">Tap to view checklist</div>
          </a>

          <a class="home-stat-card card" href="#/hisab">
            <div class="home-stat-card__head">
              <span class="home-stat-card__label">${t('hisab.this_month').toUpperCase()}</span>
              <span class="home-stat-card__badge badge-emerald" id="home-stat-hisab-badge">Remaining</span>
            </div>
            <div class="home-stat-card__value" id="home-stat-hisab-val">PKR 0</div>
            <div class="home-stat-card__meta text-quiet" id="home-stat-hisab-meta">Net Balance</div>
          </a>
        </div>

        <!-- SHARED GROCERY QUICK CHECKLIST -->
        <section class="home-section" style="margin-top:1.25rem;">
          <div class="home-section__header">
            <div>
              <span class="home-section__eyebrow">ACTIVE CHECKLIST</span>
              <h3 class="home-section__title">${t('home.shared_grocery')}</h3>
            </div>
            <a class="text-brand" href="#/grocery" style="font-size:0.85rem; font-weight:600;">${t('home.view_all')} &rarr;</a>
          </div>

          <div class="card" id="home-grocery-preview" style="padding:0.6rem 1rem;">
            <div class="text-quiet" style="text-align:center; padding:1rem 0;">Loading grocery list...</div>
          </div>
        </section>
      </div>
    `;
  },

  async afterRender() {
    const { household } = authStore.get();
    const hid = household?.id || 'demo-household';

    let pendingGroceries = 0;
    let pendingReminders = 0;
    let nextReminderTitle = '';
    let netSavings = 0;

    // 1. Fetch grocery
    try {
      const listsRes = await api.getGroceryLists(hid);
      const lists = listsRes?.data || [];
      if (lists.length > 0) {
        const firstList = lists[0];
        const detailRes = await api.getGroceryList(firstList.id, hid).catch(() => null);
        const items = detailRes?.data?.items || firstList.items || [];
        const pending = items.filter((i) => !i.is_checked);
        pendingGroceries = pending.length;

        const badgeEl = document.getElementById('home-stat-grocery-badge');
        if (badgeEl) badgeEl.textContent = `${pendingGroceries} Pending`;

        const titleEl = document.getElementById('home-stat-grocery-title');
        if (titleEl) titleEl.textContent = firstList.name || 'Weekly Essentials';

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

        const valEl = document.getElementById('home-stat-hisab-val');
        if (valEl) valEl.textContent = `PKR ${Math.abs(netSavings).toLocaleString()}`;

        const badgeEl = document.getElementById('home-stat-hisab-badge');
        if (badgeEl) {
          badgeEl.textContent = netSavings >= 0 ? t('hisab.surplus') : t('hisab.deficit');
          badgeEl.className = `home-stat-card__badge ${netSavings >= 0 ? 'badge-emerald' : 'badge-rose'}`;
        }
      }
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
    } catch (e) {}

    // Update Attention Area
    const headlineEl = document.getElementById('attention-headline');
    const subEl = document.getElementById('attention-sub');
    const iconEl = document.getElementById('attention-icon');

    if (headlineEl && subEl) {
      if (pendingGroceries === 0 && pendingReminders === 0) {
        headlineEl.textContent = t('greetings.all_caught_up');
        subEl.textContent = 'No pending groceries or urgent alerts today.';
        if (iconEl) iconEl.style.background = 'var(--wa-color-green-90)';
        if (iconEl) iconEl.style.color = 'var(--wa-color-green-40)';
      } else {
        const itemsMsg = [];
        if (pendingGroceries > 0) itemsMsg.push(`${pendingGroceries} grocery items to buy`);
        if (pendingReminders > 0) itemsMsg.push(`${pendingReminders} upcoming alert${pendingReminders > 1 ? 's' : ''}`);
        headlineEl.textContent = itemsMsg.join(' &bull; ');
        subEl.textContent = nextReminderTitle ? `Next due: ${nextReminderTitle}` : 'Tap cards below to review and take action.';
      }
    }
  },
};
