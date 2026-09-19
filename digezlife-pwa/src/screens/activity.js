import { authStore } from '../state/store.js';
import { api } from '../services/api.js';
import { icon } from '../components/icon.js';
import { formatAmount, formatDate, formatDateTime, formatRelativeTime } from '../utils/format.js';
import { confirmDialog } from '../services/dialog.js';

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

    try {
      const [txRes, listsRes, remRes, membersRes, settingsRes] = await Promise.allSettled([
        api.getHisabTransactions({ per_page: 30 }, hid),
        api.getGroceryLists(hid),
        api.getReminders(null, hid),
        api.getHouseholdMembers().catch(() => ({ data: [] })),
        api.getActivityFeedSettings().catch(() => ({ data: {} })),
      ]);

      const feedSettings = settingsRes?.value?.data?.data || {};
      const dismissedIds = feedSettings.dismissed_activities || [];
      const tenantClearedAt = feedSettings.tenant_cleared_at ? new Date(feedSettings.tenant_cleared_at).getTime() : 0;
      const personalClearedAt = feedSettings.personal_cleared_at ? new Date(feedSettings.personal_cleared_at).getTime() : 0;
      const clearThreshold = Math.max(tenantClearedAt, personalClearedAt);

      // 1. Hisab transactions
      if (txRes.status === 'fulfilled' && txRes.value) {
        const txs = Array.isArray(txRes.value?.data) ? txRes.value.data : (txRes.value?.data?.data || []);
        txs.forEach((tx) => {
          const isExpense = tx.type === 'expense';
          const actor = tx.creator?.name || (tx.created_by ? 'Household Member' : 'System');
          const title = tx.notes || `${tx.category || 'Hisab'} Transaction`;
          const dateStr = formatDate(tx.transaction_date || tx.created_at, { full: true });

          allActivities.push({
            id: `hisab-${tx.id}`,
            category: 'hisab',
            title: title,
            notes: tx.notes || 'No additional notes provided.',
            amount: tx.amount,
            currency: tx.currency || 'PKR',
            categoryName: tx.category || 'General',
            paymentMethod: tx.payment_method || 'Cash',
            actorName: actor,
            actorRole: isExpense ? 'Expense Logged' : 'Income Added',
            avatarInitials: getInitials(actor),
            avatarBg: isExpense ? 'var(--wa-color-red-90, #fee2e2)' : 'var(--wa-color-blue-90, #dbeafe)',
            avatarColor: isExpense ? 'var(--wa-color-red-40, #dc2626)' : 'var(--wa-color-blue-40, #2563eb)',
            pillClass: isExpense ? 'pill red' : 'pill green',
            pillIcon: isExpense ? 'receipt' : 'wallet',
            pillLabel: isExpense ? 'Expense' : 'Income',
            content: isExpense
              ? `Recorded expense of <strong style="color:var(--wa-color-red-40);">PKR ${formatAmount(tx.amount)}</strong> for <em>${tx.category || tx.notes || 'Household Expense'}</em>.`
              : `Added income of <strong style="color:var(--wa-color-emerald-40, #059669);">PKR ${formatAmount(tx.amount)}</strong> (${tx.category || 'Income'}).`,
            timeText: formatRelativeTime(tx.transaction_date || tx.created_at),
            dateFormatted: dateStr,
            timestamp: new Date(tx.transaction_date || tx.created_at || Date.now()).getTime(),
            linkHref: '#/hisab?tab=transactions',
            linkText: 'View in Hisab →',
          });
        });
      }

      // 2. Grocery items
      if (listsRes.status === 'fulfilled' && listsRes.value) {
        const lists = listsRes.value?.data || [];
        for (const list of lists.slice(0, 3)) {
          try {
            const detail = await api.getGroceryList(list.id, hid).catch(() => null);
            const items = detail?.data?.items || list.items || [];
            items.forEach((item) => {
              const actor = item.creator?.name || 'Household Member';
              const dateStr = formatDate(item.updated_at || item.created_at, { full: true });

              allActivities.push({
                id: `grocery-${item.id}`,
                category: 'grocery',
                title: item.name,
                notes: `List: ${list.name || 'Shared Grocery'} &bull; Status: ${item.is_checked ? 'Purchased / Completed' : 'Pending in Cart'}`,
                amount: null,
                quantity: `${item.quantity || 1} ${item.unit || 'pcs'}`,
                categoryName: item.category || 'Grocery',
                actorName: actor,
                actorRole: 'Grocery List',
                avatarInitials: getInitials(actor),
                avatarBg: 'var(--wa-color-brand-fill-quiet)',
                avatarColor: 'var(--wa-color-brand-on-quiet)',
                pillClass: item.is_checked ? 'pill green' : 'pill blue',
                pillIcon: item.is_checked ? 'check' : 'basket-shopping',
                pillLabel: item.is_checked ? 'Purchased' : 'Added',
                content: `${item.is_checked ? 'Checked off' : 'Added'} <strong style="color:var(--wa-color-text-normal);">${item.name}</strong> ${item.quantity ? `(${item.quantity} ${item.unit || 'pcs'})` : ''} on the shared Sauda list.`,
                timeText: formatRelativeTime(item.updated_at || item.created_at),
                dateFormatted: dateStr,
                timestamp: new Date(item.updated_at || item.created_at || Date.now()).getTime(),
                linkHref: '#/grocery',
                linkText: 'View in Sauda →',
              });
            });
          } catch (e) {}
        }
      }

      // 3. Reminders
      if (remRes.status === 'fulfilled' && remRes.value) {
        const reminders = remRes.value?.data || [];
        reminders.forEach((rem) => {
          const categoryLower = (rem.category || '').toLowerCase();
          const isBill = categoryLower === 'bill';
          const isMaint = categoryLower === 'maintenance';
          const isHealth = categoryLower === 'health' || categoryLower === 'medicine';

          let role = 'Household Reminder';
          let actionPrefix = rem.is_completed ? 'Completed' : 'Upcoming reminder';
          let pillIcon = rem.is_completed ? 'circle-check' : 'bell';

          if (isBill) {
            role = 'Bill Alert';
            actionPrefix = rem.is_completed ? 'Settled bill payment' : 'Upcoming bill due';
            pillIcon = rem.is_completed ? 'circle-check' : 'receipt';
          } else if (isMaint) {
            role = 'Maintenance Alert';
            actionPrefix = rem.is_completed ? 'Completed maintenance' : 'Scheduled maintenance';
            pillIcon = rem.is_completed ? 'circle-check' : 'wrench';
          } else if (isHealth) {
            role = 'Health & Medicine';
            actionPrefix = rem.is_completed ? 'Completed refill' : 'Upcoming medication';
            pillIcon = rem.is_completed ? 'circle-check' : 'capsules';
          }

          const dueFormatted = rem.due_at ? formatDate(rem.due_at, { full: true }) : 'No due date';

          allActivities.push({
            id: `bill-${rem.id}`,
            category: 'bills',
            title: rem.title,
            notes: rem.description || 'No description provided.',
            amount: rem.amount,
            currency: 'PKR',
            categoryName: rem.category || 'General',
            dueDateFormatted: dueFormatted,
            actorName: rem.category || 'Reminder',
            actorRole: role,
            avatarInitials: getInitials(rem.category || 'RM'),
            avatarBg: 'var(--wa-color-amber-90, #fef3c7)',
            avatarColor: 'var(--wa-color-amber-40, #d97706)',
            pillClass: rem.is_completed ? 'pill green' : 'pill orange',
            pillIcon: pillIcon,
            pillLabel: rem.is_completed ? 'Completed' : 'Pending',
            content: `${actionPrefix}: <strong style="color:var(--wa-color-text-normal);">${rem.title}</strong> ${rem.amount ? `(<strong style="color:var(--wa-color-red-40);">PKR ${formatAmount(rem.amount)}</strong>)` : ''}${rem.due_at ? ` due on ${formatDate(rem.due_at)}` : ''}.`,
            timeText: formatRelativeTime(rem.created_at || rem.due_at),
            dateFormatted: dueFormatted,
            timestamp: new Date(rem.created_at || rem.due_at || Date.now()).getTime(),
            linkHref: '#/reminders',
            linkText: 'View in Reminders →',
          });
        });
      }

      // 4. Household Members
      if (membersRes.status === 'fulfilled' && membersRes.value?.data) {
        const members = Array.isArray(membersRes.value.data) ? membersRes.value.data : [];
        members.forEach((m) => {
          allActivities.push({
            id: `family-${m.id}`,
            category: 'family',
            title: `Member: ${m.name}`,
            notes: `Role: ${m.role || 'Member'} &bull; Household: ${householdName}`,
            amount: null,
            actorName: m.name || 'Household Member',
            actorRole: m.role || 'Member',
            avatarInitials: getInitials(m.name),
            avatarBg: 'var(--wa-color-purple-90, #f3e8ff)',
            avatarColor: 'var(--wa-color-purple-40, #7e22ce)',
            pillClass: 'pill blue',
            pillIcon: 'users',
            pillLabel: 'Member',
            content: `Active household member: <strong style="color:var(--wa-color-text-normal);">${m.name}</strong> (${m.role || 'Family Member'}).`,
            timeText: formatRelativeTime(m.created_at),
            dateFormatted: formatDate(m.created_at || Date.now(), { full: true }),
            timestamp: new Date(m.created_at || Date.now()).getTime(),
            linkHref: '#/household',
            linkText: 'Manage Members →',
          });
        });
      }

      allActivities = allActivities.filter(a => {
        if (a.timestamp <= clearThreshold) return false;
        if (dismissedIds.includes(a.id)) return false;
        return true;
      });

      allActivities.sort((a, b) => b.timestamp - a.timestamp);

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
              // Dim the card visually while saving
              card.style.opacity = '0.4';
              card.style.pointerEvents = 'none';
              try {
                await api.dismissActivity(actId);
                await activityScreen.afterRender();
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

          try {
            await api.clearActivityFeed(feedSettings.is_owner ? 'household' : 'personal');
            activityScreen.afterRender();
          } catch (err) {
            console.error('Failed to clear feed:', err);
          }
        });
      }
    } catch (e) {
      if (container) {
        container.innerHTML = `<div class="card error" style="padding:1rem;">Failed to load activity feed.</div>`;
      }
    }
  },
};
