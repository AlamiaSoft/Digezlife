import { authStore, pushToast } from '../state/store.js';
import { api } from '../services/api.js';
import { icon } from '../components/icon.js';
import { t } from '../i18n/index.js';
import { formatDate } from '../utils/format.js';
import { householdStore } from '../state/household-store.js';
import { householdSync } from '../services/household-sync.js';

export const remindersScreen = {
  meta: { topbar: { title: 'Reminders & Tasks' }, nav: 'reminders' },

  render() {
    return `
      <div class="screen reminders-screen">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
          <div>
            <span class="text-quiet" style="font-size:0.78rem; font-weight:600; text-transform:uppercase;">SCHEDULE</span>
            <h3 style="margin:0.1rem 0 0 0; font-size:1.1rem;" id="reminders-active-heading">${t('alerts.active_alerts', {}, 'Active Alerts')}</h3>
          </div>
          <wa-button variant="brand" size="small" id="btn-open-reminder-drawer">${t('alerts.set_alert', {}, '+ Set Alert')}</wa-button>
        </div>

        <!-- Reminders List -->
        <div class="stack" id="reminders-list" style="gap:0.6rem;">
          <div class="card text-quiet" style="text-align:center; padding:1.5rem 0;">Loading reminders...</div>
        </div>

        <!-- Completed Tasks Section -->
        <div id="reminders-completed-section" style="margin-top:1.5rem; display:none;">
          <span class="text-quiet" style="font-size:0.78rem; font-weight:600; text-transform:uppercase;">${t('alerts.completed', {}, 'PAST / COMPLETED')}</span>
          <div class="stack" id="reminders-completed-list" style="gap:0.5rem; margin-top:0.5rem;"></div>
        </div>

        <!-- Add Reminder Drawer -->
        <wa-drawer id="reminder-drawer" label="${t('alerts.set_alert', {}, 'Set New Reminder')}" placement="bottom" style="--size: 460px;">
          <form id="reminder-form" onsubmit="event.preventDefault(); return false;" class="stack" style="gap:1rem;">
            <wa-input label="${t('alerts.task_title', {}, 'Title / Task Name')}" id="reminder-title" placeholder="e.g. Electricity Bill Due" required></wa-input>
            <wa-select label="Category" id="reminder-cat" value="Bill">
              <wa-option value="Bill">${t('alerts.categories.bill', {}, 'Bill / Utility')}</wa-option>
              <wa-option value="Health & Medicine">${t('alerts.categories.health', {}, 'Health & Medicine')}</wa-option>
              <wa-option value="Renewal">${t('alerts.categories.renewal', {}, 'Renewal (Token / License)')}</wa-option>
              <wa-option value="Maintenance">${t('alerts.categories.maintenance', {}, 'Maintenance & Service')}</wa-option>
              <wa-option value="Occasion">${t('alerts.categories.occasion', {}, 'Birthday / Occasion')}</wa-option>
              <wa-option value="General">${t('alerts.categories.general', {}, 'General')}</wa-option>
            </wa-select>
            <wa-input label="${t('alerts.due_date', {}, 'Due Date')}" type="date" id="reminder-due" required></wa-input>
            <wa-select label="${t('alerts.repeat', {}, 'Repeat')}" id="reminder-recurrence" value="none">
              <wa-option value="none">Does not repeat</wa-option>
              <wa-option value="weekly">Weekly</wa-option>
              <wa-option value="monthly">Monthly</wa-option>
              <wa-option value="yearly">Yearly</wa-option>
            </wa-select>
            <wa-button type="submit" variant="brand" id="btn-reminder-submit" size="l" style="width:100%; margin-top:0.5rem;">
              Save Reminder
            </wa-button>
          </form>
        </wa-drawer>
      </div>
    `;
  },

  async afterRender(params = {}) {
    const { household } = authStore.get();
    const hid = household?.id || 'demo-household';

    let reminders = [];
    const drawer = document.getElementById('reminder-drawer');
    const dueInput = document.getElementById('reminder-due');
    if (dueInput) dueInput.value = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

    const getInputValue = (id) => {
      const el = document.getElementById(id);
      if (!el) return '';
      if (el.value !== undefined && el.value !== null && el.value !== '') return String(el.value);
      const inner = el.shadowRoot ? el.shadowRoot.querySelector('input, select, textarea') : el.querySelector('input, select, textarea');
      if (inner && inner.value !== undefined && inner.value !== null && inner.value !== '') return String(inner.value);
      return el.getAttribute('value') || '';
    };

    const saveLocalReminders = () => {
      try {
        localStorage.setItem(`digez_reminders_${hid}`, JSON.stringify(reminders));
      } catch (e) {}
    };

    const loadLocalReminders = () => {
      try {
        const raw = localStorage.getItem(`digez_reminders_${hid}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            reminders = parsed;
          }
        }
      } catch (e) {}
    };

    // Initial load from local storage
    loadLocalReminders();

    const openReminderDrawer = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (drawer) {
        drawer.open = true;
      }
    };

    if (params?.action === 'add' || params?.action === 'alert') {
      setTimeout(() => { openReminderDrawer(); }, 100);
      window.history.replaceState(null, '', '#/reminders');
    }

    document.getElementById('btn-open-reminder-drawer')?.addEventListener('click', openReminderDrawer);

    const renderReminders = () => {
      const activeListEl = document.getElementById('reminders-list');
      const compSection = document.getElementById('reminders-completed-section');
      const compListEl = document.getElementById('reminders-completed-list');
      const headingEl = document.getElementById('reminders-active-heading');

      const pending = reminders.filter((r) => !r.is_completed);
      const completed = reminders.filter((r) => r.is_completed);

      if (headingEl) headingEl.textContent = `${t('alerts.active_alerts', {}, 'Active Alerts')} (${pending.length})`;

      if (activeListEl) {
        if (pending.length === 0) {
          activeListEl.innerHTML = `
            <div class="card" style="text-align:center; padding:2rem 1rem;">
              <p style="margin:0; font-weight:500;">${t('alerts.no_alerts', {}, 'No active reminders or alerts.')}</p>
              <p class="text-quiet" style="font-size:0.85rem; margin-top:0.3rem;">Tap "+ Set Alert" to create bill reminders, medicine alerts, or renewals.</p>
            </div>
          `;
        } else {
          activeListEl.innerHTML = pending.map((r) => `
            <div class="card list-row" style="display:flex; align-items:center; justify-content:space-between; padding:0.85rem 1rem;">
              <div style="display:flex; align-items:center; gap:0.75rem; flex:1; cursor:pointer;" data-toggle-rem="${r.id}">
                <wa-checkbox data-cb-rem="${r.id}"></wa-checkbox>
                <div>
                  <div style="font-weight:600; font-size:0.95rem;">${r.title}</div>
                  <div class="text-quiet" style="font-size:0.8rem;">
                    ${r.category || 'General'} &bull; Due: ${formatDate(r.due || r.due_at)}
                    ${r.recurrence && r.recurrence !== 'none' ? `(${r.recurrence})` : ''}
                  </div>
                </div>
              </div>
              <button class="app-topbar__icon-btn" data-delete-rem="${r.id}" aria-label="Delete" style="color:var(--wa-color-red-40); font-size:0.85rem;">
                ${icon('trash-can')}
              </button>
            </div>
          `).join('');
        }
      }

      if (compSection && compListEl) {
        if (completed.length > 0) {
          compSection.style.display = 'block';
          compListEl.innerHTML = completed.map((r) => `
            <div class="card list-row" style="display:flex; align-items:center; justify-content:space-between; padding:0.7rem 1rem; opacity:0.65;">
              <div style="display:flex; align-items:center; gap:0.75rem; flex:1; cursor:pointer;" data-toggle-rem="${r.id}">
                <wa-checkbox checked data-cb-rem="${r.id}"></wa-checkbox>
                <div>
                  <div style="font-weight:500; font-size:0.9rem; text-decoration:line-through;">${r.title}</div>
                  <div class="text-quiet" style="font-size:0.75rem;">Completed &bull; ${r.category || 'General'}</div>
                </div>
              </div>
              <button class="app-topbar__icon-btn" data-delete-rem="${r.id}" aria-label="Delete" style="color:var(--wa-color-red-40); font-size:0.85rem;">
                ${icon('trash-can')}
              </button>
            </div>
          `).join('');
        } else {
          compSection.style.display = 'none';
        }
      }

      // Wire checkboxes
      document.querySelectorAll('[data-toggle-rem], [data-cb-rem]').forEach((el) => {
        el.addEventListener('click', async (e) => {
          e.stopPropagation();
          const remId = el.dataset.toggleRem || el.dataset.cbRem;
          const r = reminders.find((item) => String(item.id) === String(remId));
          if (r) {
            pushToast({ message: r.is_completed ? 'Reminder restored' : 'Marked complete', variant: 'success' });
            try {
              await householdSync.mutate({
                entity: 'reminder',
                operation: 'toggle',
                optimisticUpdate: (prev) => {
                  const updatedActive = (prev.reminders?.active || []).map((item) => {
                    if (String(item.id) === String(remId)) {
                      return { ...item, is_completed: !item.is_completed };
                    }
                    return item;
                  });
                  return {
                    reminders: {
                      ...prev.reminders,
                      active: updatedActive.filter((it) => !it.is_completed),
                      completed: [
                        ...(prev.reminders?.completed || []),
                        ...updatedActive.filter((it) => it.is_completed),
                      ],
                    },
                  };
                },
                apiCall: () => api.toggleReminder(remId, hid),
              });
            } catch (err) {
              console.warn('Reminder toggle error', err);
            }
          }
        });
      });

      // Wire deletes
      document.querySelectorAll('[data-delete-rem]').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const remId = btn.dataset.deleteRem;
          pushToast({ message: 'Reminder deleted', variant: 'neutral' });
          try {
            await householdSync.mutate({
              entity: 'reminder',
              operation: 'delete',
              optimisticUpdate: (prev) => {
                const active = (prev.reminders?.active || []).filter((r) => String(r.id) !== String(remId));
                const completed = (prev.reminders?.completed || []).filter((r) => String(r.id) !== String(remId));
                return {
                  reminders: {
                    ...prev.reminders,
                    active,
                    completed,
                    pending_count: active.length,
                  },
                };
              },
              apiCall: () => api.deleteReminder(remId, hid),
            });
          } catch (err) {
            console.warn('Reminder delete error', err);
          }
        });
      });
    };

    const syncFromStore = (state) => {
      if (!state) return;
      const remState = state.reminders;
      if (remState) {
        const active = (remState.active || []).map((r) => ({ ...r, is_completed: false }));
        const completed = (remState.completed || []).map((r) => ({ ...r, is_completed: true }));
        reminders = [...active, ...completed];
      }
      renderReminders();
    };

    // Initial 0ms render from store
    syncFromStore(householdStore.get());

    // Subscribe to store updates for real-time cross-screen sync
    const unsubscribe = householdStore.subscribe(syncFromStore);

    // Background sync
    householdSync.sync({ force: false });

    // Submit reminder handler
    let isSubmitting = false;
    const handleReminderSubmit = async (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (isSubmitting) return;

      const title = getInputValue('reminder-title')?.trim();
      const category = getInputValue('reminder-cat') || 'General';
      const due = getInputValue('reminder-due') || new Date().toISOString().slice(0, 10);
      const recurrence = getInputValue('reminder-recurrence') || 'none';

      if (!title) return;

      isSubmitting = true;

      const newRem = {
        title,
        category,
        due,
        due_at: due,
        recurrence,
        is_completed: false,
      };

      if (drawer) {
        if (typeof drawer.hide === 'function') drawer.hide();
        else drawer.open = false;
      }
      document.getElementById('reminder-form')?.reset();
      pushToast({ message: `Reminder set for ${title}`, variant: 'success' });

      try {
        await householdSync.mutate({
          entity: 'reminder',
          operation: 'create',
          optimisticUpdate: (prev) => {
            const active = [{ id: 'local-' + Date.now(), ...newRem }, ...(prev.reminders?.active || [])];
            return {
              reminders: {
                ...prev.reminders,
                active,
                pending_count: active.length,
              },
            };
          },
          apiCall: () => api.createReminder({
            title,
            category,
            due_at: due,
            recurrence_rule: recurrence,
          }, hid),
        });
      } catch (err) {
        console.warn('Reminder submit fallback:', err);
      } finally {
        setTimeout(() => {
          isSubmitting = false;
        }, 250);
      }
    };

    document.getElementById('reminder-form')?.addEventListener('submit', handleReminderSubmit);
    document.getElementById('btn-reminder-submit')?.addEventListener('click', (e) => {
      e.preventDefault();
      handleReminderSubmit(e);
    });
  },
};
