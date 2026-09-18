import { authStore, pushToast } from '../state/store.js';
import { api } from '../services/api.js';
import { icon } from '../components/icon.js';
import { t } from '../i18n/index.js';

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
          <form id="reminder-form" class="stack" style="gap:1rem;">
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
            <wa-button type="submit" variant="brand" size="large" style="width:100%; margin-top:0.5rem;">
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

    if (params?.action === 'add' || params?.action === 'alert') {
      if (drawer) {
        setTimeout(() => { drawer.open = true; }, 100);
      }
    }

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
                    ${r.category || 'General'} &bull; Due: ${r.due || (r.due_at ? r.due_at.slice(0, 10) : 'Upcoming')}
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
            r.is_completed = !r.is_completed;
            renderReminders();
            pushToast({ message: r.is_completed ? 'Marked complete' : 'Reminder restored', variant: 'success' });
            try {
              await api.toggleReminder(remId, hid);
            } catch (err) {
              // local
            }
          }
        });
      });

      // Wire deletes
      document.querySelectorAll('[data-delete-rem]').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const remId = btn.dataset.deleteRem;
          reminders = reminders.filter((item) => String(item.id) !== String(remId));
          renderReminders();
          pushToast({ message: 'Reminder deleted', variant: 'neutral' });
          try {
            await api.deleteReminder(remId, hid);
          } catch (err) {
            // local
          }
        });
      });
    };

    // Fetch live reminders
    try {
      const res = await api.getReminders(null, hid);
      if (res?.data) {
        reminders = res.data.map((r) => ({
          id: r.id,
          title: r.title,
          category: r.category || 'General',
          due: r.due_at ? r.due_at.slice(0, 10) : 'Upcoming',
          recurrence: r.recurrence_rule || 'none',
          is_completed: !!r.is_completed,
        }));
      }
    } catch (e) {
      console.warn('Reminders fetch fallback');
    }

    renderReminders();

    document.getElementById('btn-open-reminder-drawer')?.addEventListener('click', () => {
      if (drawer) drawer.open = true;
    });

    document.getElementById('reminder-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('reminder-title')?.value?.trim();
      const category = document.getElementById('reminder-cat')?.value || 'General';
      const due = document.getElementById('reminder-due')?.value || new Date().toISOString().slice(0, 10);
      const recurrence = document.getElementById('reminder-recurrence')?.value || 'none';

      if (!title) return;

      const newRem = {
        id: Date.now(),
        title,
        category,
        due,
        recurrence,
        is_completed: false,
      };

      reminders.unshift(newRem);
      renderReminders();
      if (drawer) drawer.open = false;
      document.getElementById('reminder-form')?.reset();
      pushToast({ message: 'Alert scheduled', variant: 'success' });

      try {
        const createRes = await api.createReminder({
          title,
          category,
          due_at: new Date(due).toISOString(),
          recurrence_rule: recurrence,
        }, hid);
        if (createRes?.data?.id) {
          newRem.id = createRes.data.id;
        }
      } catch (err) {
        // local
      }
    });
  },
};
