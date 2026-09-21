import { navigate } from '../state/router.js';
import { authStore, setHousehold, pushToast } from '../state/store.js';
import { api } from '../services/api.js';
import { icon } from '../components/icon.js';
import { t } from '../i18n/index.js';
import { swrCache } from '../services/cache.js';
import { formatAmount, formatDate, formatRelativeTime } from '../utils/format.js';
import { householdStore } from '../state/household-store.js';
import { householdSync } from '../services/household-sync.js';
import { promptDialog } from '../services/dialog.js';

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

        <!-- 0. 5-MINUTE ONBOARDING / GHAR SETUP CHECKLIST -->
        <section class="card onboarding-checklist-card" id="home-onboarding-card" style="padding:1.15rem; margin-bottom:1rem; border:1px solid var(--wa-color-brand-border, #fed7aa); background:linear-gradient(135deg, #fff7ed 0%, #ffffff 100%); border-radius:18px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.65rem;">
            <div>
              <div style="display:flex; align-items:center; gap:6px;">
                <span class="wa-tag badge-amber" style="font-size:0.7rem; font-weight:750;">5-MINUTE SETUP</span>
                <span id="onboarding-completion-badge" class="wa-tag badge-neutral" style="font-size:0.7rem; font-weight:700;">0/5 DONE</span>
              </div>
              <h3 style="margin:0.35rem 0 0.15rem 0; font-size:1.05rem; font-weight:800;">Get Your Ghar Running</h3>
              <p class="text-quiet" style="font-size:0.8rem; margin:0;">Complete these quick steps to get full control of your household.</p>
            </div>
            <button id="btn-toggle-onboarding-card" style="background:transparent; border:none; color:var(--wa-color-text-quiet); cursor:pointer; padding:4px;" title="Dismiss Checklist">
              ${icon('xmark')}
            </button>
          </div>

          <!-- Progress Bar -->
          <div style="height:6px; background:var(--wa-color-surface-border, #e2e8f0); border-radius:99px; overflow:hidden; margin-bottom:0.85rem;">
            <div id="onboarding-progress-bar" style="width:0%; height:100%; background:var(--wa-color-brand-fill, #ea580c); border-radius:99px; transition:width 0.4s ease;"></div>
          </div>

          <!-- Checklist Items -->
          <div class="stack" id="onboarding-steps-list" style="gap:0.45rem;">
            <!-- Step 1: Name Your Ghar -->
            <div class="card onboarding-item" id="step-name-ghar" style="padding:0.6rem 0.8rem; border-radius:12px; display:flex; justify-content:space-between; align-items:center; background:#ffffff; border:1px solid var(--wa-color-surface-border, #e2e8f0);">
              <div style="display:flex; align-items:center; gap:0.65rem;">
                <div class="onboarding-check-icon" id="check-icon-1" style="width:20px; height:20px; border-radius:50%; border:2px solid var(--wa-color-surface-border, #cbd5e1); display:flex; align-items:center; justify-content:center; color:white; font-size:0.65rem;"></div>
                <div>
                  <div style="font-weight:700; font-size:0.85rem;" id="step-1-title">1. Name Your Household</div>
                  <div class="text-quiet" style="font-size:0.75rem;" id="step-1-sub">Set a name for your family home</div>
                </div>
              </div>
              <button class="btn-step-action" id="btn-action-name-ghar" style="border:none; background:var(--wa-color-brand-surface, #fff7ed); color:var(--wa-color-brand-on-normal, #ea580c); font-weight:700; font-size:0.75rem; padding:4px 10px; border-radius:8px; cursor:pointer;">
                Edit Name
              </button>
            </div>

            <!-- Step 2: Log First Expense -->
            <div class="card onboarding-item" id="step-first-expense" style="padding:0.6rem 0.8rem; border-radius:12px; display:flex; justify-content:space-between; align-items:center; background:#ffffff; border:1px solid var(--wa-color-surface-border, #e2e8f0);">
              <div style="display:flex; align-items:center; gap:0.65rem;">
                <div class="onboarding-check-icon" id="check-icon-2" style="width:20px; height:20px; border-radius:50%; border:2px solid var(--wa-color-surface-border, #cbd5e1); display:flex; align-items:center; justify-content:center; color:white; font-size:0.65rem;"></div>
                <div>
                  <div style="font-weight:700; font-size:0.85rem;" id="step-2-title">2. Log First Expense</div>
                  <div class="text-quiet" style="font-size:0.75rem;">Record a tea, petrol, or grocery spend</div>
                </div>
              </div>
              <a href="#/hisab?action=record" class="btn-step-action" id="btn-action-first-expense" style="text-decoration:none; background:var(--wa-color-brand-surface, #fff7ed); color:var(--wa-color-brand-on-normal, #ea580c); font-weight:700; font-size:0.75rem; padding:4px 10px; border-radius:8px;">
                + Expense
              </a>
            </div>

            <!-- Step 3: Add First Sauda Item -->
            <div class="card onboarding-item" id="step-first-grocery" style="padding:0.6rem 0.8rem; border-radius:12px; display:flex; justify-content:space-between; align-items:center; background:#ffffff; border:1px solid var(--wa-color-surface-border, #e2e8f0);">
              <div style="display:flex; align-items:center; gap:0.65rem;">
                <div class="onboarding-check-icon" id="check-icon-3" style="width:20px; height:20px; border-radius:50%; border:2px solid var(--wa-color-surface-border, #cbd5e1); display:flex; align-items:center; justify-content:center; color:white; font-size:0.65rem;"></div>
                <div>
                  <div style="font-weight:700; font-size:0.85rem;" id="step-3-title">3. Add First Sauda Item</div>
                  <div class="text-quiet" style="font-size:0.75rem;">Add milk, eggs, or ration item</div>
                </div>
              </div>
              <a href="#/grocery?action=add" class="btn-step-action" id="btn-action-first-grocery" style="text-decoration:none; background:var(--wa-color-brand-surface, #fff7ed); color:var(--wa-color-brand-on-normal, #ea580c); font-weight:700; font-size:0.75rem; padding:4px 10px; border-radius:8px;">
                + Item
              </a>
            </div>

            <!-- Step 4: Add First Bill Reminder -->
            <div class="card onboarding-item" id="step-first-bill" style="padding:0.6rem 0.8rem; border-radius:12px; display:flex; justify-content:space-between; align-items:center; background:#ffffff; border:1px solid var(--wa-color-surface-border, #e2e8f0);">
              <div style="display:flex; align-items:center; gap:0.65rem;">
                <div class="onboarding-check-icon" id="check-icon-4" style="width:20px; height:20px; border-radius:50%; border:2px solid var(--wa-color-surface-border, #cbd5e1); display:flex; align-items:center; justify-content:center; color:white; font-size:0.65rem;"></div>
                <div>
                  <div style="font-weight:700; font-size:0.85rem;" id="step-4-title">4. Set First Bill Reminder</div>
                  <div class="text-quiet" style="font-size:0.75rem;">Electricity, internet, or rent due date</div>
                </div>
              </div>
              <a href="#/reminders?action=add" class="btn-step-action" id="btn-action-first-bill" style="text-decoration:none; background:var(--wa-color-brand-surface, #fff7ed); color:var(--wa-color-brand-on-normal, #ea580c); font-weight:700; font-size:0.75rem; padding:4px 10px; border-radius:8px;">
                + Bill
              </a>
            </div>

            <!-- Step 5: Invite Family Member -->
            <div class="card onboarding-item" id="step-first-invite" style="padding:0.6rem 0.8rem; border-radius:12px; display:flex; justify-content:space-between; align-items:center; background:#ffffff; border:1px solid var(--wa-color-surface-border, #e2e8f0);">
              <div style="display:flex; align-items:center; gap:0.65rem;">
                <div class="onboarding-check-icon" id="check-icon-5" style="width:20px; height:20px; border-radius:50%; border:2px solid var(--wa-color-surface-border, #cbd5e1); display:flex; align-items:center; justify-content:center; color:white; font-size:0.65rem;"></div>
                <div>
                  <div style="font-weight:700; font-size:0.85rem;" id="step-5-title">5. Invite a Family Member</div>
                  <div class="text-quiet" style="font-size:0.75rem;">Share household access via WhatsApp</div>
                </div>
              </div>
              <a href="#/household?action=invite" class="btn-step-action" id="btn-action-first-invite" style="text-decoration:none; background:var(--wa-color-brand-surface, #fff7ed); color:var(--wa-color-brand-on-normal, #ea580c); font-weight:700; font-size:0.75rem; padding:4px 10px; border-radius:8px;">
                Invite
              </a>
            </div>
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

        <!-- SAVINGS TARGET HIGHLIGHT CARD -->
        <a class="card" id="home-savings-card" href="#/hisab?tab=savings" style="text-decoration:none; color:inherit; display:none; padding:0.85rem 1rem; margin-top:0.75rem; border-radius:14px; border:1px solid var(--wa-color-surface-border);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
            <div style="display:flex; align-items:center; gap:0.45rem;">
              <span style="color:var(--wa-color-brand-fill, #ea580c); font-size:0.9rem;">${icon('bullseye')}</span>
              <span style="font-weight:750; font-size:0.85rem;" id="home-savings-title">Savings Target</span>
            </div>
            <span class="wa-tag badge-blue" style="font-size:0.7rem; font-weight:700;" id="home-savings-pct">0% Saved</span>
          </div>
          <div style="height:6px; background:var(--wa-color-surface-border); border-radius:99px; overflow:hidden; margin:0.35rem 0;">
            <div id="home-savings-bar" style="width:0%; height:100%; background:var(--wa-color-brand-fill, #ea580c); border-radius:99px; transition:width 0.4s ease;"></div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.76rem; color:var(--wa-color-text-quiet);">
            <span id="home-savings-amount">PKR 0 / PKR 0</span>
            <span style="color:var(--wa-color-brand-on-normal, #ea580c); font-weight:700;">Deposit &rarr;</span>
          </div>
        </a>

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

    // 0. 5-Minute Onboarding Checklist Evaluation
    const renderOnboardingChecklist = (state) => {
      const card = document.getElementById('home-onboarding-card');
      if (!card) return;

      const isDismissed = localStorage.getItem(`gharly_onboarding_dismissed_${hid}`);
      if (isDismissed === 'true') {
        card.style.display = 'none';
        return;
      }

      const hName = state.household?.name || household?.name || 'My Household';
      const isNamed = (hName !== 'My Household' && !hName.toLowerCase().endsWith("'s household")) || localStorage.getItem(`gharly_onboarding_named_${hid}`) === 'true';
      const hasExpense = (state.transactions || []).some(t => t.type === 'expense' || t.type === 'income');
      const hasGrocery = (state.grocery?.total_count || state.grocery?.items?.length || 0) > 0;
      const hasBill = (state.reminders?.active?.length || 0) > 0 || (state.reminders?.completed?.length || 0) > 0;
      const hasInvited = (state.household?.members_count > 1) || localStorage.getItem(`gharly_onboarding_invited_${hid}`) === 'true';

      const steps = [
        { id: 1, done: isNamed, title: isNamed ? `1. Household: ${hName}` : '1. Name Your Household' },
        { id: 2, done: hasExpense, title: hasExpense ? '2. First Expense Recorded' : '2. Log First Expense' },
        { id: 3, done: hasGrocery, title: hasGrocery ? '3. First Sauda Item Added' : '3. Add First Sauda Item' },
        { id: 4, done: hasBill, title: hasBill ? '4. First Bill Scheduled' : '4. Set First Bill Reminder' },
        { id: 5, done: hasInvited, title: hasInvited ? '5. Family Member Invited' : '5. Invite a Family Member' },
      ];

      const doneCount = steps.filter(s => s.done).length;
      const progressBar = document.getElementById('onboarding-progress-bar');
      const badge = document.getElementById('onboarding-completion-badge');

      if (progressBar) progressBar.style.width = `${Math.round((doneCount / 5) * 100)}%`;
      if (badge) {
        badge.textContent = `${doneCount}/5 DONE`;
        badge.className = `wa-tag ${doneCount === 5 ? 'badge-emerald' : (doneCount > 0 ? 'badge-amber' : 'badge-neutral')}`;
      }

      steps.forEach((s) => {
        const checkIcon = document.getElementById(`check-icon-${s.id}`);
        const titleEl = document.getElementById(`step-${s.id}-title`);
        const itemEl = document.getElementById(s.id === 1 ? 'step-name-ghar' : (s.id === 2 ? 'step-first-expense' : (s.id === 3 ? 'step-first-grocery' : (s.id === 4 ? 'step-first-bill' : 'step-first-invite'))));

        if (titleEl) titleEl.textContent = s.title;

        if (checkIcon) {
          if (s.done) {
            checkIcon.style.background = 'var(--wa-color-green-40, #16a34a)';
            checkIcon.style.borderColor = 'var(--wa-color-green-40, #16a34a)';
            checkIcon.innerHTML = icon('check');
          } else {
            checkIcon.style.background = 'transparent';
            checkIcon.style.borderColor = 'var(--wa-color-surface-border, #cbd5e1)';
            checkIcon.innerHTML = '';
          }
        }

        if (itemEl) {
          if (s.done) {
            itemEl.style.opacity = '0.75';
            itemEl.style.background = 'var(--wa-color-surface-lowered, #f8fafc)';
          } else {
            itemEl.style.opacity = '1';
            itemEl.style.background = '#ffffff';
          }
        }
      });

      if (doneCount === 5) {
        card.style.background = 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)';
        card.style.borderColor = 'var(--wa-color-green-border, #bbf7d0)';
      }
    };

    // Renders home dashboard strictly from the centralized householdStore
    const renderHomeDashboard = (state) => {
      if (!state) return;
      renderOnboardingChecklist(state);
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

      // 5. Savings Goals Highlight
      const savingsGoals = Array.isArray(state.savings_goals) ? state.savings_goals : [];
      const savingsCard = document.getElementById('home-savings-card');
      if (savingsCard) {
        const activeGoal = savingsGoals.find((g) => g.status === 'active') || savingsGoals[0];
        if (activeGoal) {
          const cur = parseFloat(activeGoal.current_amount || 0);
          const tgt = parseFloat(activeGoal.target_amount || 1);
          const pct = Math.min(100, Math.round((cur / tgt) * 100));

          const titleEl = document.getElementById('home-savings-title');
          const pctEl = document.getElementById('home-savings-pct');
          const barEl = document.getElementById('home-savings-bar');
          const amountEl = document.getElementById('home-savings-amount');

          if (titleEl) titleEl.textContent = activeGoal.name;
          if (pctEl) {
            pctEl.textContent = `${pct}% Saved`;
            pctEl.className = `wa-tag ${pct >= 100 ? 'badge-emerald' : 'badge-blue'}`;
          }
          if (barEl) barEl.style.width = `${pct}%`;
          if (amountEl) amountEl.textContent = `PKR ${cur.toLocaleString()} / PKR ${tgt.toLocaleString()}`;

          savingsCard.style.display = 'block';
        } else {
          savingsCard.style.display = 'none';
        }
      }
    };

    // Render immediately from current centralized store (0ms instant render)
    renderHomeDashboard(householdStore.get());

    // Wire 5-minute setup checklist actions
    document.getElementById('btn-toggle-onboarding-card')?.addEventListener('click', () => {
      localStorage.setItem(`gharly_onboarding_dismissed_${hid}`, 'true');
      const c = document.getElementById('home-onboarding-card');
      if (c) c.style.display = 'none';
      pushToast({ message: 'Setup checklist hidden.', variant: 'neutral' });
    });

    document.getElementById('btn-action-name-ghar')?.addEventListener('click', async () => {
      const curHsh = authStore.get().household || householdStore.get().household;
      const currentName = curHsh?.name || 'My Household';
      const newName = await promptDialog({
        title: 'Name Your Household',
        message: 'Give your ghar a recognizable name (e.g. Khan Family, Gulberg Home):',
        defaultValue: currentName,
        placeholder: 'e.g. Khan Residence',
        confirmText: 'Save Name',
      });

      if (newName && newName.trim() && newName.trim() !== currentName) {
        const trimmedName = newName.trim();
        try {
          const authState = authStore.get();
          const updatedHsh = { ...(authState.household || {}), name: trimmedName };
          setHousehold(updatedHsh);
          if (updatedHsh.id) api.setHousehold(updatedHsh.id);

          // Update Home screen badge immediately
          const heroBadge = document.querySelector('.home-hero__badge');
          if (heroBadge) {
            heroBadge.innerHTML = `<span class="status-dot status-dot--active"></span> ${trimmedName} &bull; Manage`;
          }

          // Update Topbar eyebrow immediately
          const topbarEyebrow = document.querySelector('.app-topbar__brand-eyebrow');
          if (topbarEyebrow) {
            topbarEyebrow.textContent = trimmedName.toUpperCase();
          }

          // Mark onboarding checklist item
          localStorage.setItem(`gharly_onboarding_named_${hid}`, 'true');

          // Mutate via householdSync with optimistic update and authoritative reconciliation
          await householdSync.mutate({
            entity: 'household',
            operation: 'update_name',
            optimisticUpdate: (prev) => ({
              ...prev,
              household: { ...(prev.household || {}), name: trimmedName },
            }),
            apiCall: () => api.updateHousehold({ name: trimmedName }),
          });

          pushToast({ message: `Household renamed to "${trimmedName}"!`, variant: 'success' });
          renderHomeDashboard(householdStore.get());
        } catch (err) {
          console.error('Failed to update household name', err);
          pushToast({ message: err.message || 'Failed to update household name', variant: 'danger' });
        }
      }
    });

    document.getElementById('btn-action-first-invite')?.addEventListener('click', () => {
      localStorage.setItem(`gharly_onboarding_invited_${hid}`, 'true');
    });

    // Subscribe to store updates: any mutation anywhere updates Home immediately
    const unsubscribe = householdStore.subscribe((updatedState) => {
      renderHomeDashboard(updatedState);
    });

    // Background sync
    householdSync.sync({ force: false });
  },
};
