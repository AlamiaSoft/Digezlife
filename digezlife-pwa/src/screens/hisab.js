import { authStore, pushToast } from '../state/store.js';
import { api } from '../services/api.js';
import { icon } from '../components/icon.js';
import { t } from '../i18n/index.js';
import { formatAmount, formatDate, formatDateTime } from '../utils/format.js';
import { confirmDialog } from '../services/dialog.js';

const getCategoryMeta = (catName) => {
  const c = (catName || '').toLowerCase();
  if (c.includes('groc') || c.includes('sauda') || c.includes('food')) return { icon: 'basket-shopping', color: 'var(--wa-color-brand-fill)' };
  if (c.includes('util') || c.includes('bill') || c.includes('elec') || c.includes('gas') || c.includes('water')) return { icon: 'bolt', color: 'var(--wa-color-amber-40, #d97706)' };
  if (c.includes('trans') || c.includes('fuel') || c.includes('petrol') || c.includes('ride') || c.includes('bike')) return { icon: 'gas-pump', color: 'var(--wa-color-blue-40, #0284c7)' };
  if (c.includes('rent') || c.includes('house') || c.includes('maint')) return { icon: 'house', color: 'var(--wa-color-purple-40, #7c3aed)' };
  if (c.includes('med') || c.includes('health') || c.includes('doctor') || c.includes('pharma')) return { icon: 'heart-pulse', color: 'var(--wa-color-red-40, #ef4444)' };
  if (c.includes('sal') || c.includes('income') || c.includes('pay') || c.includes('bonus')) return { icon: 'briefcase', color: 'var(--wa-color-green-40, #10b981)' };
  return { icon: 'box', color: 'var(--wa-color-indigo-40, #6366f1)' };
};

export const hisabScreen = {
  meta: { topbar: { title: 'Personal Hisab' }, nav: 'hisab' },

  render() {
    return `
      <div class="screen hisab-screen">
        <!-- High-Impact Financial Overview (Stacked & Grid) -->
        <div class="hisab-overview-panel">
          <!-- Hero Net Balance Card -->
          <div class="card hisab-hero-card" style="padding:1.25rem; border-radius:18px; background:var(--wa-color-surface-default);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span class="hisab-hero-eyebrow" style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:var(--wa-color-text-quiet);">
                ${t('hisab.total_net', {}, 'TOTAL NET BALANCE')}
              </span>
              <span class="wa-tag badge-emerald" id="hisab-net-badge">SURPLUS</span>
            </div>
            <div class="hisab-hero-amount" id="hisab-total-net" style="font-size:1.85rem; font-weight:850; margin:0.35rem 0 0.2rem 0; letter-spacing:-0.02em;">PKR 0</div>
            <div class="hisab-hero-meta text-quiet" id="hisab-hero-sub" style="font-size:0.82rem;">Current monthly cashflow status</div>
          </div>

          <!-- 2-Column Income & Expense Metric Cards -->
          <div class="hisab-sub-grid">
            <div class="card hisab-metric-card">
              <div class="hisab-metric-icon" style="background:var(--wa-color-green-90); color:var(--wa-color-green-40);">
                ${icon('arrow-down')}
              </div>
              <div class="hisab-metric-body">
                <span class="hisab-metric-label">${t('hisab.income', {}, 'TOTAL INCOME')}</span>
                <span class="hisab-metric-value text-green" id="hisab-total-income">PKR 0</span>
              </div>
            </div>

            <div class="card hisab-metric-card">
              <div class="hisab-metric-icon" style="background:var(--wa-color-red-90); color:var(--wa-color-red-40);">
                ${icon('arrow-up-right')}
              </div>
              <div class="hisab-metric-body">
                <span class="hisab-metric-label">${t('hisab.expense', {}, 'TOTAL EXPENSE')}</span>
                <span class="hisab-metric-value text-red" id="hisab-total-expense">PKR 0</span>
              </div>
            </div>
          </div>

          <!-- Fast Quick Action Trigger -->
          <div style="margin-top:0.75rem; display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; width:100%; box-sizing:border-box;">
            <wa-button variant="brand" size="m" style="width:100%;" class="btn-trigger-tx-drawer">
              ${icon('plus')} Entry
            </wa-button>
            <wa-button appearance="outlined" size="m" style="width:100%;" class="btn-trigger-debt-drawer">
              ${icon('handshake')} Khata
            </wa-button>
          </div>
        </div>

        <!-- Section Navigation Tabs -->
        <div class="filter-chips-row" id="hisab-tabs" style="margin-top:1.25rem;">
          <button class="filter-chip is-active" data-tab="analytics" style="display:inline-flex; align-items:center; gap:6px;">
            ${icon('chart-simple')} <span>Overview &amp; Charts</span>
          </button>
          <button class="filter-chip" data-tab="transactions" style="display:inline-flex; align-items:center; gap:6px;">
            ${icon('receipt')} <span>Transactions</span>
          </button>
          <button class="filter-chip" data-tab="udhaar" style="display:inline-flex; align-items:center; gap:6px;">
            ${icon('handshake')} <span>Udhaar &amp; Khata</span>
          </button>
        </div>

        <!-- TAB 1: ANALYTICS & INSIGHTS VIEW -->
        <div id="view-analytics" style="margin-top:1rem;">
          <!-- 1. Spending Chart with Timeframe / Axis Selector -->
          <div class="card" style="padding:1.15rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; flex-wrap:wrap; gap:0.5rem;">
              <div style="display:flex; align-items:center; gap:0.5rem;">
                <span style="font-weight:700; font-size:0.95rem;">Spending &amp; Cashflow</span>
                <span class="wa-tag badge-emerald" id="hisab-pace-badge">Healthy</span>
              </div>

              <!-- Timeframe / Axis Selector -->
              <div class="chart-interval-tabs" style="display:inline-flex; background:var(--wa-color-surface-lowered, #f1f5f9); border:1px solid var(--wa-color-surface-border, #e2e8f0); border-radius:999px; padding:2px;">
                <button type="button" class="btn-chart-interval is-active" data-interval="days" style="border:none; background:transparent; padding:3px 10px; font-size:0.74rem; font-weight:700; border-radius:999px; cursor:pointer; color:var(--wa-color-brand-on-normal, #ea580c);">Days</button>
                <button type="button" class="btn-chart-interval" data-interval="weeks" style="border:none; background:transparent; padding:3px 10px; font-size:0.74rem; font-weight:700; border-radius:999px; cursor:pointer; color:var(--wa-color-text-quiet, #64748b);">Weeks</button>
                <button type="button" class="btn-chart-interval" data-interval="months" style="border:none; background:transparent; padding:3px 10px; font-size:0.74rem; font-weight:700; border-radius:999px; cursor:pointer; color:var(--wa-color-text-quiet, #64748b);">Months</button>
              </div>
            </div>

            <!-- Legend Indicator -->
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.72rem; color:var(--wa-color-text-quiet); margin-bottom:0.5rem;">
              <div style="display:flex; gap:12px; align-items:center;">
                <span style="display:inline-flex; align-items:center; gap:5px;">
                  <span style="width:8px; height:8px; border-radius:2px; background:var(--wa-color-brand-fill, #ea580c); display:inline-block;"></span> Expenses
                </span>
                <span style="display:inline-flex; align-items:center; gap:5px;">
                  <span style="width:8px; height:8px; border-radius:2px; background:var(--wa-color-green-40, #16a34a); display:inline-block;"></span> Income
                </span>
              </div>
              <span class="text-quiet chart-interval-hint-target" style="font-size:0.7rem;">Daily view</span>
            </div>

            <!-- Dynamic CSS Bar Chart -->
            <div style="min-height:130px; display:flex; align-items:flex-end; gap:8px; padding:6px 2px 4px;" id="hisab-chart-bars" class="hisab-chart-bars-target">
              <div class="text-quiet" style="width:100%; text-align:center; padding:1.5rem 0; font-size:0.85rem;">Calculating spending pace...</div>
            </div>
          </div>

          <!-- 2. Expense Category Breakdown -->
          <div class="card" style="margin-top:0.85rem; padding:1.15rem;">
            <div style="font-weight:700; font-size:0.95rem; margin-bottom:1rem;">Expense Breakdown by Category</div>
            <div class="stack hisab-category-breakdown-target" id="hisab-category-breakdown" style="gap:0.85rem;">
              <div class="text-quiet" style="text-align:center; padding:1rem 0; font-size:0.85rem;">Loading categories...</div>
            </div>
          </div>

          <!-- 3. Financial Insight Card -->
          <div class="card" style="margin-top:0.85rem; padding:1rem; background:var(--wa-color-amber-95, #fef3c7); border:1px solid var(--wa-color-amber-80, #fcd34d);">
            <div style="display:flex; align-items:center; gap:0.4rem; font-weight:800; font-size:0.9rem; color:var(--wa-color-amber-30, #78350f);">
              <span>${icon('lightbulb')}</span> Household Insight
            </div>
            <p id="hisab-insight-text" style="margin:0.4rem 0 0 0; font-size:0.83rem; line-height:1.5; color:var(--wa-color-amber-20, #451a03);">
              Analyzing monthly household cashflow...
            </p>
          </div>

          <!-- 4. Recent Entries on Overview Tab -->
          <div style="margin-top:1.25rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
              <span class="text-quiet" style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">Recent Entries</span>
              <button id="btn-view-all-txs" style="border:none; background:transparent; font-size:0.8rem; font-weight:700; color:var(--wa-color-brand-on-normal); cursor:pointer; padding:0;">View all &rarr;</button>
            </div>
            <div class="stack" id="overview-transactions-preview" style="gap:0.5rem;">
              <div class="card text-quiet" style="text-align:center; padding:1rem 0; font-size:0.85rem;">Loading recent entries...</div>
            </div>
          </div>
        </div>

        <!-- TAB 2: TRANSACTIONS VIEW -->
        <div id="view-transactions" style="display:none; margin-top:1rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
            <div class="tx-filter-chips" style="display:flex; gap:0.5rem; overflow-x:auto; padding-bottom:4px; margin-right:1rem;">
              <button type="button" class="btn-tx-filter is-active" data-filter="all" style="border:1px solid var(--wa-color-brand-border, #ea580c); background:var(--wa-color-brand-surface, #fff7ed); color:var(--wa-color-brand-on-normal, #ea580c); padding:4px 12px; font-size:0.8rem; font-weight:600; border-radius:999px; cursor:pointer; flex-shrink:0;">All</button>
              <button type="button" class="btn-tx-filter" data-filter="expense" style="border:1px solid var(--wa-color-surface-border, #e2e8f0); background:var(--wa-color-surface, #fff); color:var(--wa-color-text-normal, #334155); padding:4px 12px; font-size:0.8rem; font-weight:600; border-radius:999px; cursor:pointer; flex-shrink:0;">Expenses</button>
              <button type="button" class="btn-tx-filter" data-filter="income" style="border:1px solid var(--wa-color-surface-border, #e2e8f0); background:var(--wa-color-surface, #fff); color:var(--wa-color-text-normal, #334155); padding:4px 12px; font-size:0.8rem; font-weight:600; border-radius:999px; cursor:pointer; flex-shrink:0;">Income</button>
            </div>
            <wa-button variant="brand" size="s" class="btn-trigger-tx-drawer" style="flex-shrink:0;">${icon('plus')} Entry</wa-button>
          </div>

          <div class="stack" id="transactions-list" style="gap:0.6rem;">
            <div class="card text-quiet" style="text-align:center; padding:1.5rem 0;">Loading transactions...</div>
          </div>
        </div>

        <!-- TAB 3: UDHAAR & KHATA VIEW -->
        <div id="view-udhaar" style="display:none; margin-top:1rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
            <span class="text-quiet" style="font-size:0.85rem; font-weight:700; text-transform:uppercase;">Debts &amp; Receivables</span>
            <wa-button variant="brand" size="s" class="btn-trigger-debt-drawer">${icon('plus')} Khata</wa-button>
          </div>

          <div class="stack" id="debts-list" style="gap:0.6rem;">
            <div class="card text-quiet" style="text-align:center; padding:1.5rem 0;">Loading debts...</div>
          </div>
        </div>

        <!-- Add Transaction Drawer -->
        <wa-drawer id="tx-drawer" label="${t('hisab.record_entry', {}, 'Record Transaction')}" placement="bottom" style="--size: 480px;">
          <form id="tx-form" onsubmit="event.preventDefault(); return false;" class="stack" style="gap:1rem;">
            <wa-select label="Type" id="tx-type" value="expense">
              <wa-option value="expense">Expense</wa-option>
              <wa-option value="income">Income</wa-option>
            </wa-select>
            <wa-input label="Amount (PKR)" type="number" id="tx-amount" placeholder="e.g. 2500" required></wa-input>
            <wa-input label="Description / Title" id="tx-notes" placeholder="e.g. Groceries at Metro" required></wa-input>
            <wa-select label="Category" id="tx-category" value="Groceries">
              <wa-option value="Groceries">Groceries &amp; Sauda</wa-option>
              <wa-option value="Utilities">Utilities &amp; Bills</wa-option>
              <wa-option value="Rent">Housing / Rent</wa-option>
              <wa-option value="Transport">Transport &amp; Fuel</wa-option>
              <wa-option value="Medical">Medical &amp; Health</wa-option>
              <wa-option value="Salary">Salary / Income</wa-option>
              <wa-option value="Other">Other</wa-option>
            </wa-select>
            <wa-input label="Date" type="date" id="tx-date"></wa-input>
            <wa-button type="submit" variant="brand" id="btn-tx-submit" size="l" style="width:100%; margin-top:0.5rem;">
              Save Entry
            </wa-button>
          </form>
        </wa-drawer>

        <!-- Add Debt Drawer -->
        <wa-drawer id="debt-drawer" label="Add Udhaar / Debt Entry" placement="bottom" style="--size: 480px;">
          <form id="debt-form" onsubmit="event.preventDefault(); return false;" class="stack" style="gap:1rem;">
            <wa-select label="Direction" id="debt-dir" value="lent">
              <wa-option value="lent">${t('hisab.money_owed_to_me', {}, 'I Lent Money (Receivable)')}</wa-option>
              <wa-option value="borrowed">${t('hisab.money_i_owe', {}, 'I Borrowed Money (Payable)')}</wa-option>
            </wa-select>
            <wa-input label="Person Name" id="debt-person" placeholder="e.g. Tariq Mehmood" required></wa-input>
            <wa-input label="Phone Number (for WhatsApp reminder)" id="debt-phone" placeholder="e.g. +923001234567"></wa-input>
            <wa-input label="Amount (PKR)" type="number" id="debt-amount" placeholder="e.g. 15000" required></wa-input>
            <wa-input label="Due Date" type="date" id="debt-due"></wa-input>
            <wa-button type="submit" variant="brand" id="btn-debt-submit" size="l" style="width:100%; margin-top:0.5rem;">
              Save Debt Record
            </wa-button>
          </form>
        </wa-drawer>
      </div>
    `;
  },

  async afterRender(params = {}) {
    const { household } = authStore.get();
    const hid = household?.id || 'demo-household';

    let transactions = [];
    let debts = [];
    let income = 0;
    let expense = 0;
    let backendSummary = null;

    const txDrawer = document.getElementById('tx-drawer');
    const debtDrawer = document.getElementById('debt-drawer');

    const openTxDrawer = (type = 'expense') => {
      const txTypeEl = document.getElementById('tx-type');
      if (txTypeEl) txTypeEl.value = type;
      if (txDrawer) {
        document.getElementById('tx-form')?.reset();
        
        // Pre-populate date with today
        const dateInput = document.getElementById('tx-date');
        if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);

        txDrawer.removeAttribute('data-edit-id');
        txDrawer.label = t('hisab.record_entry', {}, 'Record Transaction');
        txDrawer.open = true;
      }
    };

    const openDebtDrawer = () => {
      if (debtDrawer) {
        debtDrawer.open = true;
      }
    };

    // Tab switching
    const switchTab = (tab) => {
      document.querySelectorAll('#hisab-tabs .filter-chip').forEach((b) => {
        b.classList.toggle('is-active', b.dataset.tab === tab);
      });
      const analyticsView = document.getElementById('view-analytics');
      const txView = document.getElementById('view-transactions');
      const udhaarView = document.getElementById('view-udhaar');

      if (analyticsView) analyticsView.style.display = tab === 'analytics' ? 'block' : 'none';
      if (txView) txView.style.display = tab === 'transactions' ? 'block' : 'none';
      if (udhaarView) udhaarView.style.display = tab === 'udhaar' ? 'block' : 'none';
    };

    // Immediately bind tab triggers
    document.querySelectorAll('#hisab-tabs .filter-chip').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab(btn.dataset.tab);
      });
    });

    document.getElementById('btn-view-all-txs')?.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab('transactions');
    });

    // Immediately bind drawer triggers
    document.querySelectorAll('.btn-trigger-tx-drawer, [data-action="open-tx-drawer"], #btn-open-tx-drawer').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openTxDrawer();
      });
    });

    document.querySelectorAll('.btn-trigger-debt-drawer, [data-action="open-debt-drawer"], #btn-open-debt-drawer').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openDebtDrawer();
      });
    });

    // Default today for tx-date
    const txDateInput = document.getElementById('tx-date');
    if (txDateInput) txDateInput.value = new Date().toISOString().slice(0, 10);

    const debtDueInput = document.getElementById('debt-due');
    if (debtDueInput) debtDueInput.value = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

    // Deep linking: check query parameters (e.g. #/hisab?action=record or #/hisab?action=debt)
    if (params?.action === 'record' || params?.action === 'spend' || params?.action === 'add' || params?.action === 'expense' || params?.action === 'income') {
      setTimeout(() => {
        openTxDrawer(params?.type === 'income' || params?.action === 'income' ? 'income' : 'expense');
      }, 50);
      window.history.replaceState(null, '', '#/hisab');
    }
    if (params?.action === 'debt' || params?.action === 'udhaar') {
      setTimeout(() => {
        openDebtDrawer();
      }, 50);
      window.history.replaceState(null, '', '#/hisab');
    }
    if (params?.tab) {
      switchTab(params.tab);
    }

    let currentTxFilter = 'all';
    document.querySelectorAll('.btn-tx-filter').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        currentTxFilter = btn.dataset.filter;
        
        // Update active state
        document.querySelectorAll('.btn-tx-filter').forEach((b) => {
          const isActive = b.dataset.filter === currentTxFilter;
          b.classList.toggle('is-active', isActive);
          if (isActive) {
            b.style.borderColor = 'var(--wa-color-brand-border, #ea580c)';
            b.style.background = 'var(--wa-color-brand-surface, #fff7ed)';
            b.style.color = 'var(--wa-color-brand-on-normal, #ea580c)';
          } else {
            b.style.borderColor = 'var(--wa-color-surface-border, #e2e8f0)';
            b.style.background = 'var(--wa-color-surface, #fff)';
            b.style.color = 'var(--wa-color-text-normal, #334155)';
          }
        });
        
        // Re-render list
        renderTransactions();
      });
    });

    let selectedInterval = 'days';

    const renderChartBars = () => {
      const chartBarsEls = document.querySelectorAll('.hisab-chart-bars-target');
      const hintEls = document.querySelectorAll('.chart-interval-hint-target');

      // Update button active state across all interval tabs
      document.querySelectorAll('.btn-chart-interval').forEach((btn) => {
        const isActive = btn.dataset.interval === selectedInterval;
        btn.classList.toggle('is-active', isActive);
        btn.style.color = isActive ? 'var(--wa-color-brand-on-normal, #ea580c)' : 'var(--wa-color-text-quiet, #64748b)';
        btn.style.background = isActive ? 'var(--wa-color-surface-card, #ffffff)' : 'transparent';
        btn.style.boxShadow = isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none';
      });

      if (hintEls) {
        hintEls.forEach((h) => {
          h.textContent = selectedInterval === 'days' ? 'Daily view' : selectedInterval === 'weeks' ? 'Weekly view' : 'Monthly view';
        });
      }

      let items = [];
      const today = new Date();

      if (selectedInterval === 'days') {
        // Daily view
        const curYear = today.getFullYear();
        const curMonth = today.getMonth();
        const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
        const maxDayNum = Math.min(today.getDate() + 1, daysInMonth);
        const dayBuckets = {};

        for (let d = 1; d <= maxDayNum; d++) {
          const dStr = `${curYear}-${String(curMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const dateObj = new Date(curYear, curMonth, d);
          const dayShort = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          dayBuckets[dStr] = {
            label: `${d} ${dayShort}`,
            fullDate: dStr,
            income: 0,
            expense: 0,
            txs: [],
          };
        }

        transactions.forEach((t) => {
          let tDate = '';
          const raw = t.date || t.transaction_date;
          if (raw) {
            const p = new Date(String(raw).replace(' ', 'T'));
            if (!isNaN(p.getTime())) tDate = p.toISOString().slice(0, 10);
          }
          if (!tDate) tDate = today.toISOString().slice(0, 10);

          if (!dayBuckets[tDate]) {
            const p = new Date(tDate);
            const d = !isNaN(p.getDate()) ? p.getDate() : 1;
            const dayShort = !isNaN(p.getTime()) ? p.toLocaleDateString('en-US', { weekday: 'short' }) : '';
            dayBuckets[tDate] = {
              label: `${d} ${dayShort}`,
              fullDate: tDate,
              income: 0,
              expense: 0,
              txs: [],
            };
          }

          const amt = parseFloat(t.amount || 0);
          if (t.type === 'income') {
            dayBuckets[tDate].income += amt;
          } else {
            dayBuckets[tDate].expense += amt;
          }
          dayBuckets[tDate].txs.push(t);
        });

        const allKeys = Object.keys(dayBuckets).sort();
        items = allKeys.map((k) => dayBuckets[k]);
        if (items.length > 10) {
          const activeOrRecent = items.filter((item, idx) => item.income > 0 || item.expense > 0 || idx >= items.length - 7);
          if (activeOrRecent.length >= 5) {
            items = activeOrRecent;
          }
        }
      } else if (selectedInterval === 'weeks') {
        // Weekly view
        const weekBuckets = [
          { label: 'Week 1', sub: '1–7', income: 0, expense: 0, txs: [] },
          { label: 'Week 2', sub: '8–14', income: 0, expense: 0, txs: [] },
          { label: 'Week 3', sub: '15–21', income: 0, expense: 0, txs: [] },
          { label: 'Week 4', sub: '22–31', income: 0, expense: 0, txs: [] },
        ];

        transactions.forEach((t) => {
          let d = 1;
          const raw = t.date || t.transaction_date;
          if (raw) {
            const p = new Date(String(raw).replace(' ', 'T'));
            if (!isNaN(p.getDate())) d = p.getDate();
          }
          const wIdx = d <= 7 ? 0 : d <= 14 ? 1 : d <= 21 ? 2 : 3;
          const amt = parseFloat(t.amount || 0);
          if (t.type === 'income') {
            weekBuckets[wIdx].income += amt;
          } else {
            weekBuckets[wIdx].expense += amt;
          }
          weekBuckets[wIdx].txs.push(t);
        });

        if (transactions.length === 0 && backendSummary?.weekly_pace && Array.isArray(backendSummary.weekly_pace)) {
          backendSummary.weekly_pace.forEach((w, idx) => {
            if (weekBuckets[idx]) {
              weekBuckets[idx].expense = parseFloat(w.amount || 0);
            }
          });
        }

        items = weekBuckets;
      } else if (selectedInterval === 'months') {
        // Monthly view
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const mBuckets = [];
        for (let i = 5; i >= 0; i--) {
          const mDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
          mBuckets.push({
            label: monthNames[mDate.getMonth()],
            year: mDate.getFullYear(),
            monthKey: `${mDate.getFullYear()}-${String(mDate.getMonth() + 1).padStart(2, '0')}`,
            income: 0,
            expense: 0,
            txs: [],
          });
        }

        transactions.forEach((t) => {
          let mKey = '';
          const raw = t.date || t.transaction_date;
          if (raw) {
            const p = new Date(String(raw).replace(' ', 'T'));
            if (!isNaN(p.getTime())) mKey = `${p.getFullYear()}-${String(p.getMonth() + 1).padStart(2, '0')}`;
          }
          if (!mKey) mKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
          const b = mBuckets.find((m) => m.monthKey === mKey);
          const amt = parseFloat(t.amount || 0);
          if (b) {
            if (t.type === 'income') b.income += amt;
            else b.expense += amt;
            b.txs.push(t);
          }
        });

        const currentMBucket = mBuckets[mBuckets.length - 1];
        if (currentMBucket && currentMBucket.income === 0 && currentMBucket.expense === 0 && (income > 0 || expense > 0)) {
          currentMBucket.income = income;
          currentMBucket.expense = expense;
        }

        items = mBuckets;
      }

      const maxVal = Math.max(...items.map((i) => Math.max(i.income || 0, i.expense || 0)), 1);
      const hasAnyData = items.some((i) => (i.income > 0 || i.expense > 0));

      let chartHTML = '';
      if (!hasAnyData && transactions.length === 0) {
        chartHTML = `
          <div style="display:flex; width:100%; gap:8px; height:130px; align-items:flex-end; padding:8px 4px 4px; box-sizing:border-box;">
            ${[1, 2, 3, 4].map(w => `
              <div style="flex:1; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; gap:6px;">
                <span style="font-size:0.68rem; color:var(--wa-color-text-quiet, #64748b);">-</span>
                <div style="width:100%; height:75px; background:var(--wa-color-surface-lowered, #f1f5f9); border:1px solid var(--wa-color-surface-border, #e2e8f0); border-radius:8px; box-sizing:border-box;"></div>
                <span style="font-size:0.72rem; font-weight:600; color:var(--wa-color-text-quiet, #64748b);">Week ${w}</span>
              </div>
            `).join('')}
          </div>
        `;
      } else {
        chartHTML = `
          <div style="display:flex; width:100%; gap:8px; height:135px; align-items:flex-end; padding:6px 2px 4px; box-sizing:border-box; overflow-x:auto; -webkit-overflow-scrolling:touch;">
            ${items.map((item) => {
              const incPct = item.income > 0 ? Math.round((item.income / maxVal) * 100) : 0;
              const expPct = item.expense > 0 ? Math.round((item.expense / maxVal) * 100) : 0;
              
              let topLabel = '-';
              if (item.income > 0 && item.expense > 0) {
                topLabel = `+${formatAmount(item.income)}`;
              } else if (item.income > 0) {
                topLabel = `+${formatAmount(item.income)}`;
              } else if (item.expense > 0) {
                topLabel = `-${formatAmount(item.expense)}`;
              }

              const tooltipText = `${item.label}${item.sub ? ' (' + item.sub + ')' : ''}: Income PKR ${item.income.toLocaleString()} | Expense PKR ${item.expense.toLocaleString()} (${item.txs ? item.txs.length : 0} entries)`;

              return `
                <div style="flex:1; min-width:44px; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; gap:5px; cursor:pointer;" title="${tooltipText}">
                  <span style="font-size:0.65rem; font-weight:750; color:${item.income > 0 ? 'var(--wa-color-green-40, #16a34a)' : (item.expense > 0 ? 'var(--wa-color-brand-on-normal, #ea580c)' : 'var(--wa-color-text-quiet, #64748b)')}; white-space:nowrap;">
                    ${topLabel}
                  </span>
                  <div style="width:100%; height:80px; display:flex; align-items:flex-end; justify-content:center; gap:3px; background:var(--wa-color-surface-lowered, #f1f5f9); border:1px solid var(--wa-color-surface-border, #e2e8f0); border-radius:8px; padding:3px; box-sizing:border-box;">
                    <!-- Income Bar (Green) -->
                    <div style="flex:1; max-width:14px; height:${Math.max(item.income > 0 ? 12 : 0, incPct)}%; min-height:${item.income > 0 ? '6px' : '0'}; background:var(--wa-color-green-40, #16a34a); border-radius:4px; transition:height 0.4s ease;" title="Income: PKR ${item.income.toLocaleString()}"></div>
                    <!-- Expense Bar (Orange/Red) -->
                    <div style="flex:1; max-width:14px; height:${Math.max(item.expense > 0 ? 12 : 0, expPct)}%; min-height:${item.expense > 0 ? '6px' : '0'}; background:var(--wa-color-brand-fill, #ea580c); border-radius:4px; transition:height 0.4s ease;" title="Expense: PKR ${item.expense.toLocaleString()}"></div>
                  </div>
                  <span style="font-size:0.68rem; font-weight:600; color:var(--wa-color-text-quiet, #64748b); white-space:nowrap;">${item.label}</span>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }

      chartBarsEls.forEach((el) => { el.innerHTML = chartHTML; });
    };

    // Wire chart interval tabs
    document.querySelectorAll('.btn-chart-interval').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        selectedInterval = btn.dataset.interval;
        renderChartBars();
      });
    });

    const updateSummaries = () => {
      const calcIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);
      const calcExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);
      if (backendSummary?.total_income !== undefined) {
        income = parseFloat(backendSummary.total_income || 0);
      } else {
        income = calcIncome;
      }
      if (backendSummary?.total_expense !== undefined) {
        expense = parseFloat(backendSummary.total_expense || 0);
      } else {
        expense = calcExpense;
      }

      const net = income - expense;
      const incomeEl = document.getElementById('hisab-total-income');
      const expenseEl = document.getElementById('hisab-total-expense');
      const netEl = document.getElementById('hisab-total-net');
      const netBadge = document.getElementById('hisab-net-badge');
      const heroSub = document.getElementById('hisab-hero-sub');
      const paceBadges = document.querySelectorAll('#hisab-pace-badge, .hisab-pace-badge');
      const chartBarsEls = document.querySelectorAll('.hisab-chart-bars-target');
      const catListEls = document.querySelectorAll('.hisab-category-breakdown-target');
      const insightEl = document.getElementById('hisab-insight-text');

      if (incomeEl) incomeEl.textContent = `PKR ${formatAmount(income)}`;
      if (expenseEl) expenseEl.textContent = `PKR ${formatAmount(expense)}`;
      if (netEl) {
        netEl.textContent = `${net < 0 ? '-' : ''}PKR ${formatAmount(net)}`;
        netEl.style.color = net >= 0 ? 'var(--wa-color-green-40)' : 'var(--wa-color-red-40)';
      }
      if (netBadge) {
        if (income === 0 && expense === 0) {
          netBadge.textContent = 'BALANCED';
          netBadge.className = 'wa-tag badge-neutral';
        } else {
          netBadge.textContent = net >= 0 ? 'SURPLUS' : 'DEFICIT';
          netBadge.className = `wa-tag ${net >= 0 ? 'badge-emerald' : 'badge-rose'}`;
        }
      }
      if (heroSub) {
        if (income === 0 && expense === 0) {
          heroSub.textContent = 'No income or expenses recorded this month';
        } else {
          heroSub.textContent = net >= 0 ? 'Healthy surplus funds available this month' : 'Monthly expenses exceed total income';
        }
      }
      paceBadges.forEach((pb) => {
        if (income === 0 && expense === 0) {
          pb.textContent = 'No Activity';
          pb.className = 'wa-tag badge-neutral';
        } else {
          pb.textContent = net >= 0 ? 'Good Pace' : 'High Spending';
          pb.className = `wa-tag ${net >= 0 ? 'badge-emerald' : 'badge-amber'}`;
        }
      });

      // 1. DYNAMIC MULTI-INTERVAL SPENDING & CASHFLOW CHART
      renderChartBars();

      // 2. DYNAMIC EXPENSE CATEGORY BREAKDOWN
      const expenseTxs = transactions.filter((t) => t.type === 'expense');
      const catTotals = {};
      const catCounts = {};
      expenseTxs.forEach((t) => {
        const cat = t.category || 'Other';
        catTotals[cat] = (catTotals[cat] || 0) + parseFloat(t.amount || 0);
        catCounts[cat] = (catCounts[cat] || 0) + 1;
      });

      if (Object.keys(catTotals).length === 0 && backendSummary?.categories && Array.isArray(backendSummary.categories)) {
        backendSummary.categories.forEach((c) => {
          const cat = c.category || 'Other';
          catTotals[cat] = parseFloat(c.total || 0);
          catCounts[cat] = 1;
        });
      }

      const catList = Object.entries(catTotals)
        .map(([category, total]) => ({ category, total, count: catCounts[category] || 1 }))
        .sort((a, b) => b.total - a.total);

      const totalSpent = catList.reduce((acc, c) => acc + c.total, 0) || expense || 1;

      let catBreakdownHTML = '';
      if (catList.length === 0) {
        catBreakdownHTML = `
          <div style="text-align:center; padding:1.25rem 0; color:var(--wa-color-text-quiet); font-size:0.85rem;">
            No expense records logged yet for this month.
          </div>
        `;
      } else {
        catBreakdownHTML = catList.map((c) => {
          const meta = getCategoryMeta(c.category);
          const pct = Math.max(3, Math.round((c.total / totalSpent) * 100));
          return `
            <div style="cursor:pointer; padding:0.25rem 0; margin-bottom:0.6rem;" title="${c.count} ${c.count === 1 ? 'transaction' : 'transactions'} in ${c.category} totaling PKR ${c.total.toLocaleString()}">
              <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; margin-bottom:0.35rem;">
                <span style="display:inline-flex; align-items:center; gap:8px; font-weight:600;">
                  <span style="color:${meta.color}; display:inline-flex; align-items:center;">${icon(meta.icon)}</span>
                  <span>${c.category}</span>
                </span>
                <span style="font-size:0.85rem;">
                  <strong>PKR ${formatAmount(c.total)}</strong>
                  <span class="text-quiet" style="font-size:0.75rem; font-weight:500; margin-left:4px;">(${pct}%)</span>
                </span>
              </div>
              <div style="height:8px; background:var(--wa-color-surface-border, #e2e8f0); border-radius:99px; overflow:hidden;">
                <div style="width:${pct}%; height:100%; background:${meta.color}; border-radius:99px; transition:width 0.4s ease;"></div>
              </div>
            </div>
          `;
        }).join('');
      }
      catListEls.forEach((el) => { el.innerHTML = catBreakdownHTML; });

      // 3. DYNAMIC HOUSEHOLD INSIGHT
      if (insightEl) {
        if (income === 0 && expense === 0) {
          insightEl.textContent = 'No transactions recorded yet this month. Tap "+ Record Entry" to log your household income or expenses.';
        } else if (net >= 0) {
          const rate = income > 0 ? Math.round((net / income) * 100) : 100;
          let text = `Healthy monthly surplus of PKR ${formatAmount(net)} (${rate}% savings rate). `;
          if (catList.length > 0) {
            const top = catList[0];
            const topPct = Math.round((top.total / totalSpent) * 100);
            text += `Top expenditure is ${top.category} at PKR ${formatAmount(top.total)} (${topPct}% of expenses)`;
            if (catList.length > 1) {
              const second = catList[1];
              const secondPct = Math.round((second.total / totalSpent) * 100);
              text += ` followed by ${second.category} (${secondPct}%).`;
            } else {
              text += '.';
            }
          }
          insightEl.textContent = text;
        } else {
          const deficit = Math.abs(net);
          let text = `Monthly expenses (PKR ${formatAmount(expense)}) exceed total income by PKR ${formatAmount(deficit)}. `;
          if (catList.length > 0) {
            const top = catList[0];
            const topPct = Math.round((top.total / totalSpent) * 100);
            text += `${top.category} is your highest expense driver (${topPct}% of spending at PKR ${formatAmount(top.total)}).`;
          }
          insightEl.textContent = text;
        }
      }
    };

    const renderTransactions = () => {
      const listEl = document.getElementById('transactions-list');
      const overviewPreviewEl = document.getElementById('overview-transactions-preview');

      const filteredTxs = transactions.filter((t) => typeof currentTxFilter === 'undefined' || currentTxFilter === 'all' || t.type === currentTxFilter);

      const txCardHTML = (t) => `
        <div class="card list-row" data-tx-id="${t.id}" style="display:flex; align-items:center; justify-content:space-between; padding:0.85rem 1rem;">
          <div style="display:flex; align-items:center; gap:0.75rem; flex: 1;">
            <div class="list-row__icon" style="background:${t.type === 'income' ? 'var(--wa-color-green-90)' : 'var(--wa-color-red-90)'}; color:${t.type === 'income' ? 'var(--wa-color-green-40)' : 'var(--wa-color-red-40)'};">
              ${icon(t.type === 'income' ? 'arrow-down' : 'arrow-up-right')}
            </div>
            <div>
              <div style="font-weight:600; font-size:0.95rem;">${t.notes || t.title || t.category}</div>
              <div class="text-quiet" style="font-size:0.8rem;">${t.category} &bull; ${formatDate(t.date)}</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:700; font-size:1rem; color:${t.type === 'income' ? 'var(--wa-color-green-40)' : 'var(--wa-color-red-40)'};">
              ${t.type === 'income' ? '+' : '-'} PKR ${parseFloat(t.amount || 0).toLocaleString()}
            </div>
            <div style="display:flex; justify-content:flex-end; gap:0.4rem; margin-top:0.3rem;">
              <button class="btn-tx-edit" data-id="${t.id}" style="background:transparent; border:none; color:var(--wa-color-text-quiet); cursor:pointer; padding:2px;">
                ${icon('pen')}
              </button>
              <button class="btn-tx-delete" data-id="${t.id}" style="background:transparent; border:none; color:var(--wa-color-red-40); cursor:pointer; padding:2px;">
                ${icon('trash-can')}
              </button>
            </div>
          </div>
        </div>
      `;

      if (listEl) {
        if (filteredTxs.length === 0) {
          listEl.innerHTML = `
            <div class="card" style="text-align:center; padding:1.5rem 1rem;">
              <p style="margin:0; font-weight:500;">No transactions found.</p>
              <p class="text-quiet" style="font-size:0.85rem; margin-top:0.3rem;">Tap "+ Entry" to log expenses or income.</p>
            </div>
          `;
        } else {
          listEl.innerHTML = filteredTxs.map(txCardHTML).join('');
        }
      }

      if (overviewPreviewEl) {
        if (transactions.length === 0) {
          overviewPreviewEl.innerHTML = `
            <div class="card" style="text-align:center; padding:1.5rem 1rem;">
              <p style="margin:0; font-weight:500;">No transactions recorded this month.</p>
              <p class="text-quiet" style="font-size:0.85rem; margin-top:0.3rem;">Tap "+ Record Entry" to log expenses or income.</p>
            </div>
          `;
        } else {
          overviewPreviewEl.innerHTML = transactions.slice(0, 4).map(txCardHTML).join('');
        }
      }

      // Attach Delete Listeners
      const attachTxListeners = (container) => {
        if (!container) return;
        
        // Delete
        container.querySelectorAll('.btn-tx-delete').forEach((btn) => {
          btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const txId = btn.getAttribute('data-id');
            const tx = transactions.find((t) => String(t.id) === String(txId));
            if (!tx) return;

            const confirmed = await confirmDialog({
              title: 'Delete Transaction',
              message: `Are you sure you want to delete ${tx.type === 'income' ? 'income' : 'expense'} of PKR ${parseFloat(tx.amount || 0).toLocaleString()}?`,
              confirmText: 'Delete',
              variant: 'danger'
            });

            if (!confirmed) return;

            // Remove locally
            transactions = transactions.filter((t) => String(t.id) !== String(txId));
            saveLocalHisab();
            renderTransactions();
            pushToast({ message: 'Transaction deleted', variant: 'success' });
            
            // API
            try {
              await api.destroyHisabTransaction(txId, hid);
              syncHisab();
            } catch (err) {
              console.error('Failed to delete transaction', err);
              // Optimistic revert could be implemented here
            }
          });
        });

        // Edit
        container.querySelectorAll('.btn-tx-edit').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const txId = btn.getAttribute('data-id');
            const tx = transactions.find((t) => String(t.id) === String(txId));
            if (!tx) return;

            // Open the new entry drawer and populate it
            document.getElementById('tx-amount').value = tx.amount;
            document.getElementById('tx-type').value = tx.type;
            document.getElementById('tx-category').value = tx.category;
            document.getElementById('tx-date').value = (tx.date || '').split('T')[0];
            document.getElementById('tx-notes').value = tx.notes || tx.title || '';
            
            // Save txId on the drawer or a hidden field so we know it's an edit
            const drawerEl = document.getElementById('tx-drawer');
            if (drawerEl) {
              drawerEl.setAttribute('data-edit-id', tx.id);
              drawerEl.label = 'Edit Transaction';
              drawerEl.open = true;
            }
          });
        });
      };

      attachTxListeners(listEl);
      attachTxListeners(overviewPreviewEl);
    };

    const renderDebts = () => {
      const listEl = document.getElementById('debts-list');
      if (!listEl) return;

      if (debts.length === 0) {
        listEl.innerHTML = `
          <div class="card" style="text-align:center; padding:2rem 1rem;">
            <p style="margin:0; font-weight:500;">${t('hisab.no_debts', {}, 'No active debts or receivables.')}</p>
            <p class="text-quiet" style="font-size:0.85rem; margin-top:0.3rem;">All household lendings and borrowings are settled.</p>
          </div>
        `;
        return;
      }

      listEl.innerHTML = debts.map((d) => {
        const remaining = parseFloat(d.amount || 0) - parseFloat(d.paid || d.paid_amount || 0);
        const dueFormatted = formatDate(d.due || d.due_date);
        return `
          <div class="card" style="padding:1rem;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div>
                <span class="wa-tag ${d.direction === 'lent' ? 'badge-amber' : 'badge-purple'}">
                  ${d.direction === 'lent' ? t('hisab.money_owed_to_me', {}, 'Receivable (Lent)') : t('hisab.money_i_owe', {}, 'Payable (Borrowed)')}
                </span>
                <h4 style="margin:0.4rem 0 0.2rem 0; font-size:1.05rem;">${d.person || d.person_name}</h4>
                <div class="text-quiet" style="font-size:0.8rem;">Due: ${dueFormatted} &bull; Phone: ${d.phone || d.person_phone || 'N/A'}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:1.1rem; font-weight:700;">PKR ${remaining.toLocaleString()}</div>
                <div class="text-quiet" style="font-size:0.75rem;">Total: PKR ${parseFloat(d.amount).toLocaleString()}</div>
              </div>
            </div>

            <div style="display:flex; gap:0.5rem; margin-top:0.85rem;">
              ${
                d.direction === 'lent'
                  ? `
                    <wa-button size="s" appearance="outlined" data-whatsapp-debt="${d.id}" style="flex:1;">
                      ${icon('comment-sms')} ${t('hisab.whatsapp_reminder', {}, 'WhatsApp Reminder')}
                    </wa-button>
                  `
                  : ''
              }
              <wa-button size="s" variant="brand" data-settle-debt="${d.id}" style="flex:1;">
                ${t('hisab.settle_paid', {}, 'Settle / Paid')}
              </wa-button>
            </div>
          </div>
        `;
      }).join('');

      // WhatsApp reminders
      listEl.querySelectorAll('[data-whatsapp-debt]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const debtId = btn.dataset.whatsappDebt;
          const d = debts.find((item) => String(item.id) === String(debtId));
          if (d) {
            const remaining = parseFloat(d.amount) - parseFloat(d.paid || d.paid_amount || 0);
            const text = `Salam ${d.person || d.person_name}, gentle reminder regarding the pending amount of PKR ${remaining.toLocaleString()} (due ${d.due || d.due_date || 'soon'}). Please settle when convenient. Thank you! - GharlyApp`;
            const cleanPhone = (d.phone || d.person_phone || '').replace(/[^0-9]/g, '');
            window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
          }
        });
      });

      // Settle debt
      listEl.querySelectorAll('[data-settle-debt]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const debtId = btn.dataset.settleDebt;
          const d = debts.find((item) => String(item.id) === String(debtId));
          if (d) {
            d.paid = d.amount;
            debts = debts.filter((item) => String(item.id) !== String(debtId));
            saveLocalHisab();
            renderDebts();
            pushToast({ message: 'Debt marked settled', variant: 'success' });
            try {
              await api.settleHisabDebt(debtId, d.amount, hid);
            } catch (e) {
              // local
            }
          }
        });
      });
    };

    const getInputValue = (id) => {
      const el = document.getElementById(id);
      if (!el) return '';
      if (el.value !== undefined && el.value !== null && el.value !== '') return String(el.value);
      const inner = el.shadowRoot ? el.shadowRoot.querySelector('input, select, textarea') : el.querySelector('input, select, textarea');
      if (inner && inner.value !== undefined && inner.value !== null && inner.value !== '') return String(inner.value);
      return el.getAttribute('value') || '';
    };

    const saveLocalHisab = () => {
      try {
        localStorage.setItem(`digez_hisab_txs_${hid}`, JSON.stringify(transactions));
        localStorage.setItem(`digez_hisab_debts_${hid}`, JSON.stringify(debts));
      } catch (e) {}
    };

    const loadLocalHisab = () => {
      try {
        const rawTxs = localStorage.getItem(`digez_hisab_txs_${hid}`);
        if (rawTxs) transactions = JSON.parse(rawTxs) || [];
        const rawDebts = localStorage.getItem(`digez_hisab_debts_${hid}`);
        if (rawDebts) debts = JSON.parse(rawDebts) || [];
      } catch (e) {}
    };

    // Initialize from local storage immediately
    loadLocalHisab();
    updateSummaries();
    renderTransactions();
    renderDebts();

    // Fetch live summaries & transactions
    const loadData = async () => {
      try {
        const [sumRes, txRes, debtsRes] = await Promise.all([
          api.getHisabSummary(null, hid).catch(() => null),
          api.getHisabTransactions(null, hid).catch(() => null),
          api.getHisabDebts(null, hid).catch(() => null),
        ]);

        if (sumRes?.data) {
          backendSummary = sumRes.data;
          if (sumRes.data.total_income !== undefined) income = parseFloat(sumRes.data.total_income || 0);
          if (sumRes.data.total_expense !== undefined) expense = parseFloat(sumRes.data.total_expense || 0);
        }
        if (txRes?.data) {
          const rawList = Array.isArray(txRes.data) ? txRes.data : (txRes.data?.data || []);
          if (rawList.length > 0) {
            transactions = rawList.map((t) => ({
              id: t.id,
              title: t.notes || t.category,
              notes: t.notes,
              amount: parseFloat(t.amount || 0),
              type: t.type,
              category: t.category,
              date: t.transaction_date || t.date || new Date().toISOString().slice(0, 10),
            }));
            saveLocalHisab();
          }
        }
        if (debtsRes?.data) {
          const rawDebts = Array.isArray(debtsRes.data) ? debtsRes.data : (debtsRes.data?.data || []);
          if (rawDebts.length > 0) {
            debts = rawDebts;
            saveLocalHisab();
          }
        }
      } catch (e) {
        console.warn('Hisab backend fetch fallback');
      }

      updateSummaries();
      renderTransactions();
      renderDebts();
    };

    await loadData();

    // Pull-to-refresh listener
    document.addEventListener('app:refresh', async () => {
      await loadData();
    });

    // Add transaction submit handler
    let isTxSubmitting = false;
    const handleTxSubmit = async (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (isTxSubmitting) return;

      const type = getInputValue('tx-type') || 'expense';
      const amount = parseFloat(getInputValue('tx-amount')) || 0;
      const category = getInputValue('tx-category') || (type === 'income' ? 'Salary' : 'Groceries');
      const notes = getInputValue('tx-notes')?.trim() || (type === 'income' ? 'Salary' : category);
      const date = getInputValue('tx-date') || new Date().toISOString().slice(0, 10);

      if (amount <= 0) {
        pushToast({ message: 'Please enter a valid amount greater than 0', variant: 'warning' });
        return;
      }

      isTxSubmitting = true;

      const txDrawerEl = document.getElementById('tx-drawer');
      const editId = txDrawerEl ? txDrawerEl.getAttribute('data-edit-id') : null;

      const txPayload = {
        type,
        amount,
        category,
        notes,
        transaction_date: date,
      };

      if (editId) {
        // Edit flow
        const existingTx = transactions.find((t) => String(t.id) === String(editId));
        if (existingTx) {
          existingTx.title = notes;
          existingTx.notes = notes;
          existingTx.amount = amount;
          existingTx.type = type;
          existingTx.category = category;
          existingTx.date = date;
          
          saveLocalHisab();
          updateSummaries();
          renderTransactions();
          pushToast({ message: 'Transaction updated successfully!', variant: 'success' });

          try {
            await api.updateHisabTransaction(editId, txPayload, hid);
          } catch (err) {
            console.error('Failed to update transaction on backend', err);
          }
        }
      } else {
        // Create flow
        const newTx = {
          id: 'local-' + Date.now(),
          title: notes,
          notes,
          amount,
          type,
          category,
          date,
        };

        transactions.unshift(newTx);
        saveLocalHisab();
        updateSummaries();
        renderTransactions();
        pushToast({ message: 'Transaction recorded successfully!', variant: 'success' });

        try {
          const res = await api.addHisabTransaction(txPayload, hid);
          if (res?.data?.id) {
            newTx.id = res.data.id;
            saveLocalHisab();
          }
        } catch (err) {
          console.warn('Backend hisab tx sync fallback:', err);
        }
      }

      if (txDrawer) {
        if (typeof txDrawer.hide === 'function') txDrawer.hide();
        else txDrawer.open = false;
      }
      document.getElementById('tx-form')?.reset();
      const txDateInputReset = document.getElementById('tx-date');
      if (txDateInputReset) txDateInputReset.value = new Date().toISOString().slice(0, 10);
      
      // Clear edit state
      if (txDrawerEl) {
        txDrawerEl.removeAttribute('data-edit-id');
        txDrawerEl.label = 'New Entry';
      }

      setTimeout(() => {
        isTxSubmitting = false;
      }, 300);
    };

    document.getElementById('tx-form')?.addEventListener('submit', handleTxSubmit);
    document.getElementById('btn-tx-submit')?.addEventListener('click', (e) => {
      e.preventDefault();
      handleTxSubmit(e);
    });

    // Add debt submit handler
    let isDebtSubmitting = false;
    const handleDebtSubmit = async (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (isDebtSubmitting) return;

      const direction = getInputValue('debt-dir') || 'lent';
      const person = getInputValue('debt-person')?.trim();
      const phone = getInputValue('debt-phone')?.trim();
      const amount = parseFloat(getInputValue('debt-amount')) || 0;
      const due = getInputValue('debt-due') || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

      if (!person) {
        pushToast({ message: 'Please enter a person name', variant: 'warning' });
        return;
      }
      if (amount <= 0) {
        pushToast({ message: 'Please enter a valid amount', variant: 'warning' });
        return;
      }

      isDebtSubmitting = true;

      const newDebt = {
        id: 'local-' + Date.now(),
        direction,
        person,
        person_name: person,
        phone,
        person_phone: phone,
        amount,
        paid: 0,
        paid_amount: 0,
        due,
        due_date: due,
      };

      debts.unshift(newDebt);
      saveLocalHisab();
      renderDebts();

      if (debtDrawer) {
        if (typeof debtDrawer.hide === 'function') debtDrawer.hide();
        else debtDrawer.open = false;
      }
      document.getElementById('debt-form')?.reset();

      pushToast({ message: 'Debt record created successfully', variant: 'success' });

      try {
        const res = await api.addHisabDebt(
          {
            direction,
            person_name: person,
            person_phone: phone,
            amount,
            due_date: due,
          },
          hid
        );
        if (res?.data?.id) {
          newDebt.id = res.data.id;
          saveLocalHisab();
        }
      } catch (err) {
        console.warn('Backend hisab debt sync fallback:', err);
      } finally {
        setTimeout(() => {
          isDebtSubmitting = false;
        }, 300);
      }
    };

    document.getElementById('debt-form')?.addEventListener('submit', handleDebtSubmit);
    document.getElementById('btn-debt-submit')?.addEventListener('click', (e) => {
      e.preventDefault();
      handleDebtSubmit(e);
    });
  },
};

