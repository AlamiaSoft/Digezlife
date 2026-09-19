import { authStore } from '../state/store.js';
import { api } from '../services/api.js';
import { icon } from '../components/icon.js';
import { formatAmount, formatDate, formatDateTime, formatRelativeTime } from '../utils/format.js';
import { confirmDialog } from '../services/dialog.js';
import { householdStore } from '../state/household-store.js';
import { householdSync } from '../services/household-sync.js';

function getInitials(name) {
  if (!name) return 'FM';
  return name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const activityScreen = {
  meta: { topbar: { title: 'Family Activity', back: true }, nav: 'home' },

  render() {
    const { household } = authStore.get();
    const householdName = household?.name || 'My Household';

    return `
      <div class="screen activity-screen">
        <!-- Header Description -->
        <div style="margin-bottom:1rem; display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <h2 style="font-size:1.25rem; font-weight:800; margin:0 0 0.25rem 0;">Household Activity Feed</h2>
            <p class="text-quiet" style="font-size:0.85rem; margin:0; line-height:1.45;">
              Real-time feed of grocery updates, hisab logs, and bill payments in <strong>${householdName}</strong>. Tap any card for full details.
            </p>
          </div>
          <button id="btn-clear-all-activity" style="background:var(--wa-color-surface-lowered); border:1px solid var(--wa-color-surface-border); padding:6px 12px; border-radius:8px; cursor:pointer; font-weight:600; font-size:0.85rem; display:inline-flex; align-items:center; gap:6px; color:var(--wa-color-text-normal);">
            ${icon('trash-can')} Clear All Activity
          </button>
        </div>

        <!-- Filter Chips -->
        <div class="filter-chips-row" id="activity-filters" style="margin-bottom:1rem; display:flex; gap:0.4rem; overflow-x:auto; padding-bottom:0.25rem;">
          <button class="filter-chip is-active" data-filter="all" style="display:inline-flex; align-items:center; gap:5px;">
            ${icon('list')} <span>All Updates</span>
          </button>
          <button class="filter-chip" data-filter="grocery" style="display:inline-flex; align-items:center; gap:5px;">
            ${icon('basket-shopping')} <span>Grocery</span>
          </button>
          <button class="filter-chip" data-filter="hisab" style="display:inline-flex; align-items:center; gap:5px;">
            ${icon('receipt')} <span>Hisab</span>
          </button>
          <button class="filter-chip" data-filter="bills" style="display:inline-flex; align-items:center; gap:5px;">
            ${icon('bolt')} <span>Bills</span>
          </button>
          <button class="filter-chip" data-filter="family" style="display:inline-flex; align-items:center; gap:5px;">
            ${icon('users')} <span>Family</span>
          </button>
        </div>

        <!-- Activity Stream Container -->
        <div class="stack" id="activity-stream-list" style="gap:0.75rem;">
          <div class="card" style="text-align:center; padding:2rem 1rem; color:var(--wa-color-text-quiet);">
            Loading household activity feed...
          </div>
        </div>

        <!-- Interactive Activity Detail Drawer -->
        <wa-drawer id="activity-detail-drawer" label="Event Details" placement="bottom" style="--size: 460px;">
          <div id="activity-detail-body" class="stack" style="gap:1rem;">
            <!-- Injected dynamically -->
          </div>
        </wa-drawer>
      </div>
    `;
  },

  async afterRender() {
    const { user, household } = authStore.get();
    const hid = household?.id || 'demo-household';

    const container = document.getElementById('activity-stream-list');
    const detailDrawer = document.getElementById('activity-detail-drawer');
    const detailBody = document.getElementById('activity-detail-body');
    let allActivities = [];

    const mapStoreToActivities = (state) => {
      const raw = Array.isArray(state.activity) ? state.activity : [];
      return raw.map((item) => {
        const isTx = item.entity_type === 'transaction';
        const isGrocery = item.entity_type === 'grocery';
        const isExpense = item.type === 'expense';
        const isIncome = item.type === 'income';
        const isChecked = item.type === 'checked';
        const actor = item.actor_name || 'Household Member';

        let category = isTx ? 'hisab' : (isGrocery ? 'grocery' : 'bills');
        let role = isTx ? (isExpense ? 'Expense Logged' : 'Income Added') : (isGrocery ? (isChecked ? 'Purchased' : 'Added') : 'Reminder');
        let pillClass = isTx ? (isExpense ? 'pill red' : 'pill green') : (isGrocery ? 'pill blue' : 'pill orange');
        let pillIcon = isTx ? (isExpense ? 'receipt' : 'wallet') : (isGrocery ? (isChecked ? 'check' : 'basket-shopping') : 'bell');
        let pillLabel = isTx ? (isExpense ? 'Expense' : 'Income') : (isGrocery ? (isChecked ? 'Purchased' : 'Added') : 'Reminder');
        let bg = isTx ? (isExpense ? 'var(--wa-color-red-90, #fee2e2)' : 'var(--wa-color-blue-90, #dbeafe)') : (isGrocery ? 'var(--wa-color-brand-fill-quiet)' : 'var(--wa-color-amber-90, #fef3c7)');
        let color = isTx ? (isExpense ? 'var(--wa-color-red-40, #dc2626)' : 'var(--wa-color-blue-40, #2563eb)') : (isGrocery ? 'var(--wa-color-brand-on-quiet)' : 'var(--wa-color-amber-40, #d97706)');

        let content = '';
        if (isTx) {
          content = isExpense
            ? `Recorded expense of <strong style="color:var(--wa-color-red-40);">PKR ${formatAmount(item.amount)}</strong> for <em>${item.category || item.title || 'Household Expense'}</em>.`
            : `Added income of <strong style="color:var(--wa-color-emerald-40, #059669);">PKR ${formatAmount(item.amount)}</strong> (${item.category || 'Income'}).`;
        } else if (isGrocery) {
          content = `${isChecked ? 'Checked off' : 'Added'} <strong style="color:var(--wa-color-text-normal);">${item.title}</strong> (${item.quantity || '1 pcs'}) on the shared Sauda list.`;
        } else {
          content = `Active reminder: <strong style="color:var(--wa-color-text-normal);">${item.title}</strong> (${item.category || 'General'}) due ${item.time_text || 'soon'}.`;
        }

        return {
          id: item.id,
          category,
          title: item.title,
          notes: item.title,
          amount: item.amount,
          currency: 'PKR',
          categoryName: item.category || 'General',
          actorName: actor,
          actorRole: role,
          avatarInitials: getInitials(actor),
          avatarBg: bg,
          avatarColor: color,
          pillClass,
          pillIcon,
          pillLabel,
          content,
          timeText: item.time_text,
          dateFormatted: item.time_text,
          timestamp: item.timestamp,
          linkHref: isTx ? '#/hisab?tab=transactions' : (isGrocery ? '#/grocery' : '#/reminders'),
          linkText: isTx ? 'View in Hisab →' : (isGrocery ? 'View in Sauda →' : 'View in Reminders →'),
        };
      });
    };

    allActivities = mapStoreToActivities(householdStore.get());

      function showActivityDetail(act) {
        if (!detailBody || !detailDrawer) return;

        detailBody.innerHTML = `
          <div style="display:flex; align-items:center; gap:0.75rem; padding-bottom:0.75rem; border-bottom:1px solid var(--wa-color-surface-border);">
            <div class="avatar sm" style="width:42px; height:42px; font-size:1rem; background:${act.avatarBg}; color:${act.avatarColor}; font-weight:800;">
              ${act.avatarInitials}
            </div>
            <div style="flex:1; min-width:0;">
              <h3 style="margin:0; font-size:1.1rem; font-weight:800; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                ${act.title}
              </h3>
              <div style="display:flex; align-items:center; gap:0.5rem; margin-top:0.2rem;">
                <span class="${act.pillClass}" style="font-size:0.7rem; display:inline-flex; align-items:center; gap:4px;">
                  ${icon(act.pillIcon)} ${act.pillLabel}
                </span>
                <span class="text-quiet" style="font-size:0.78rem;">${act.actorRole}</span>
              </div>
            </div>
          </div>

          <div class="stack" style="gap:0.6rem; font-size:0.88rem;">
            ${
              act.amount !== null && act.amount !== undefined
                ? `
                  <div style="display:flex; justify-content:space-between; align-items:center; padding:0.5rem 0.75rem; background:var(--wa-color-surface-lowered); border-radius:8px;">
                    <span class="text-quiet" style="font-weight:600;">Amount</span>
                    <strong style="font-size:1.15rem; color:${act.pillLabel === 'Income' ? 'var(--wa-color-green-40)' : 'var(--wa-color-text-normal)'};">
                      PKR ${parseFloat(act.amount).toLocaleString()}
                    </strong>
                  </div>
                `
                : ''
            }
            ${
              act.categoryName
                ? `
                  <div style="display:flex; justify-content:space-between; align-items:center; padding:0.25rem 0;">
                    <span class="text-quiet">Category</span>
                    <strong>${act.categoryName}</strong>
                  </div>
                `
                : ''
            }
            ${
              act.paymentMethod
                ? `
                  <div style="display:flex; justify-content:space-between; align-items:center; padding:0.25rem 0;">
                    <span class="text-quiet">Payment Method</span>
                    <strong>${act.paymentMethod}</strong>
                  </div>
                `
                : ''
            }
            ${
              act.quantity
                ? `
                  <div style="display:flex; justify-content:space-between; align-items:center; padding:0.25rem 0;">
                    <span class="text-quiet">Quantity / Unit</span>
                    <strong>${act.quantity}</strong>
                  </div>
                `
                : ''
            }
            <div style="display:flex; justify-content:space-between; align-items:center; padding:0.25rem 0;">
              <span class="text-quiet">Logged By</span>
              <strong>${act.actorName}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; padding:0.25rem 0;">
              <span class="text-quiet">Date / Time</span>
              <span>${act.dateFormatted} (${act.timeText})</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start; padding:0.25rem 0;">
              <span class="text-quiet">Description / Notes</span>
              <span style="text-align:right; max-width:60%; font-weight:500;">${act.notes}</span>
            </div>
          </div>

          <div style="display:flex; gap:0.5rem; margin-top:0.75rem;">
            <a href="${act.linkHref}" class="wa-button" style="flex:1; text-decoration:none; display:inline-flex; justify-content:center; align-items:center; padding:0.6rem 1rem; border-radius:8px; background:var(--wa-color-brand-fill); color:#fff; font-weight:700; font-size:0.88rem;">
              ${act.linkText}
            </a>
            <wa-button appearance="outlined" id="btn-dismiss-activity" variant="danger" style="flex:0 0 auto;">Dismiss Log</wa-button>
            <wa-button appearance="outlined" id="btn-close-activity-drawer" style="flex:0 0 auto;">Close</wa-button>
          </div>
        `;

        const closeBtn = document.getElementById('btn-close-activity-drawer');
        if (closeBtn) closeBtn.addEventListener('click', () => (detailDrawer.open = false));

        const dismissBtn = document.getElementById('btn-dismiss-activity');
        if (dismissBtn) {
          dismissBtn.addEventListener('click', async () => {
            detailDrawer.open = false;
            try {
              await api.dismissActivity(act.id);
              await activityScreen.afterRender();
            } catch (e) {
              console.error('Failed to dismiss activity', e);
            }
          });
        }

        detailDrawer.open = true;
      }

      function renderFilteredCards(activeFilter) {
        if (!container) return;
        const filtered = activeFilter === 'all' ? allActivities : allActivities.filter((a) => a.category === activeFilter);

        if (filtered.length === 0) {
          container.innerHTML = `
            <div class="card" style="text-align:center; padding:2.5rem 1rem; color:var(--wa-color-text-quiet);">
              <div style="font-size:1.8rem; margin-bottom:0.5rem; opacity:0.6;">${icon('inbox')}</div>
              <div style="font-weight:700; font-size:0.95rem; margin-bottom:0.25rem;">No activity records found</div>
              <div style="font-size:0.8rem;">Start logging expenses, grocery items, or reminders to populate your household stream.</div>
            </div>
          `;
          return;
        }

        container.innerHTML = filtered.map((act) => `
          <div class="card activity-card" data-act-id="${act.id}" style="padding:1rem; cursor:pointer; transition:transform 0.15s ease, box-shadow 0.15s ease;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div style="display:flex; align-items:center; gap:0.65rem;">
                <div class="avatar sm" style="background:${act.avatarBg}; color:${act.avatarColor}; font-weight:700;">
                  ${act.avatarInitials}
                </div>
                <div>
                  <div style="font-weight:700; font-size:0.92rem;">${act.actorName}</div>
                  <div class="text-quiet" style="font-size:0.78rem;">${act.actorRole}</div>
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="${act.pillClass}" style="font-size:0.7rem; display:inline-flex; align-items:center; gap:4px;">
                  ${icon(act.pillIcon)} ${act.pillLabel}
                </span>
                <button class="btn-dismiss-inline" data-act-id="${act.id}" style="background:transparent; border:none; padding:4px; color:var(--wa-color-text-quiet); cursor:pointer; opacity:0.6; transition:opacity 0.2s;" title="Dismiss from feed" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'">
                  ${icon('xmark')}
                </button>
              </div>
            </div>
            <p style="margin:0.75rem 0 0.35rem 0; font-size:0.88rem; line-height:1.45;">
              ${act.content}
            </p>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem; font-size:0.78rem; color:var(--wa-color-text-quiet);">
              <span>${act.timeText}</span>
              <span style="color:var(--wa-color-brand-on-normal); font-weight:700; display:inline-flex; align-items:center; gap:3px;">
                View Details &rarr;
              </span>
            </div>
          </div>
        `).join('');

        // Attach click listeners to open drawer or dismiss
        container.querySelectorAll('.activity-card').forEach((card) => {
          card.addEventListener('click', async (e) => {
            const dismissBtn = e.target.closest('.btn-dismiss-inline');
            const actId = card.getAttribute('data-act-id');

            if (dismissBtn) {
              e.stopPropagation();
              card.style.opacity = '0.4';
              card.style.pointerEvents = 'none';
              try {
                await api.dismissActivity(actId);
                await householdSync.sync({ force: true });
              } catch (err) {
                console.error('Failed to dismiss activity inline', err);
                card.style.opacity = '1';
                card.style.pointerEvents = 'auto';
              }
              return;
            }

            const targetAct = allActivities.find((a) => a.id === actId);
            if (targetAct) showActivityDetail(targetAct);
          });
        });
      }

      renderFilteredCards('all');

      // Setup filter chip button listeners
      const filterChips = document.getElementById('activity-filters');
      if (filterChips) {
        filterChips.addEventListener('click', (e) => {
          const btn = e.target.closest('.filter-chip');
          if (!btn) return;
          filterChips.querySelectorAll('.filter-chip').forEach((c) => c.classList.remove('is-active'));
          btn.classList.add('is-active');
          renderFilteredCards(btn.getAttribute('data-filter'));
        });
      }

      const btnClearAll = document.getElementById('btn-clear-all-activity');
      if (btnClearAll) {
        btnClearAll.addEventListener('click', async () => {
          const confirmed = await confirmDialog({
            title: 'Clear All Activity',
            message: 'Are you sure you want to clear the activity feed?',
            confirmText: 'Clear Feed',
            variant: 'danger'
          });

          if (!confirmed) return;

          const feedSettings = householdStore.get().feed_settings || {};
          try {
            await api.clearActivityFeed(feedSettings.is_owner ? 'household' : 'personal');
            await householdSync.sync({ force: true });
          } catch (err) {
            console.error('Failed to clear feed:', err);
          }
        });
      }

      // Subscribe to store updates for real-time reactivity
      const unsubscribe = householdStore.subscribe((state) => {
        allActivities = mapStoreToActivities(state);
        const activeChip = document.querySelector('#activity-filters .filter-chip.is-active');
        const filter = activeChip ? activeChip.getAttribute('data-filter') : 'all';
        renderFilteredCards(filter);
      });

      // Background sync
      householdSync.sync({ force: false });
  },
};
